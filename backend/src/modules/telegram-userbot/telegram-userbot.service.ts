import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadsService } from '../leads/leads.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { SmsService } from '../sms/sms.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { LeadSource } from '@prisma/client';

// gramjs imports
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';

@Injectable()
export class TelegramUserbotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramUserbotService.name);
  private client: TelegramClient;
  private isConnected = false;

  // UZ phone pattern: +998XX XXX XX XX (with optional spaces, dashes, dots)
  private readonly phoneRegex = /\+998[\s\-.]?\d{2}[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}/g;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private leadsService: LeadsService,
    private monitoredGroupsService: MonitoredGroupsService,
    private smsService: SmsService,
    private botService: TelegramBotService,
  ) {}

  async onModuleInit() {
    const apiId = parseInt(this.config.get('TELEGRAM_API_ID', '0'));
    const apiHash = this.config.get('TELEGRAM_API_HASH', '');
    const sessionString = this.config.get('TELEGRAM_SESSION_STRING', '');

    if (!apiId || !apiHash || !sessionString) {
      this.logger.warn('Telegram userbot credentials not set, userbot disabled');
      return;
    }

    try {
      const session = new StringSession(sessionString);
      this.client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
      });

      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Telegram userbot connected');

      await this.setupMessageHandler();
    } catch (error) {
      this.logger.error(`Userbot connection failed: ${error.message}`);
    }
  }

  private async setupMessageHandler() {
    const groups = await this.monitoredGroupsService.findActive();
    if (groups.length === 0) {
      this.logger.warn('No active monitored groups found');
      return;
    }

    const chatIds = groups.map(g => g.telegramId);
    this.logger.log(`Monitoring ${chatIds.length} groups`);

    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        try {
          await this.handleNewMessage(event, groups);
        } catch (error) {
          this.logger.error(`Message handler error: ${error.message}`);
        }
      },
      new NewMessage({ chats: chatIds }),
    );
  }

  private async handleNewMessage(event: NewMessageEvent, groups: any[]) {
    const message = event.message;
    if (!message.text) return;

    const chatId = message.chatId?.toString();
    if (!chatId) return;

    // Find matching group
    const group = groups.find(g => g.telegramId === chatId || g.telegramId === `-100${chatId}`);
    if (!group) return;

    // Keyword filter
    if (group.keywords && group.keywords.length > 0) {
      const lowerText = message.text.toLowerCase();
      const hasKeyword = group.keywords.some((kw: string) => lowerText.includes(kw.toLowerCase()));
      if (!hasKeyword) return;
    }

    // Extract phone numbers
    const phones = message.text.match(this.phoneRegex);
    if (!phones || phones.length === 0) return;

    this.logger.log(`Found ${phones.length} phone(s) in group "${group.title}"`);

    for (const rawPhone of phones) {
      // Normalize phone: remove spaces, dashes, dots
      const phone = rawPhone.replace(/[\s\-.]/g, '');

      try {
        const lead = await this.leadsService.create({
          phone,
          source: LeadSource.TELEGRAM_GROUP,
          sourceGroup: group.title,
          sourceMessage: message.text.substring(0, 500),
        });

        // Increment group lead count
        await this.monitoredGroupsService.incrementLeadCount(group.telegramId);

        // Notify admin group via bot
        await this.botService.notifyNewLead({
          id: lead.id,
          phone: lead.phone,
          name: lead.name || undefined,
          source: lead.source,
          sourceGroup: lead.sourceGroup || undefined,
          sourceMessage: lead.sourceMessage || undefined,
        });

        // Auto send promo SMS
        await this.smsService.autoSendPromo(lead.id);

        this.logger.log(`Lead created from group: ${phone}`);
      } catch (error) {
        if (error.message?.includes('already exists')) {
          this.logger.debug(`Duplicate lead skipped: ${phone}`);
        } else {
          this.logger.error(`Lead creation error: ${error.message}`);
        }
      }
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      uptime: this.isConnected ? 'active' : 'disconnected',
    };
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('Userbot disconnected');
    }
  }
}
