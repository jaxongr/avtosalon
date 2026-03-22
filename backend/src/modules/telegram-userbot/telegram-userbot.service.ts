import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadsService } from '../leads/leads.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { SmsService } from '../sms/sms.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { LeadSource } from '@prisma/client';

import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';

@Injectable()
export class TelegramUserbotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramUserbotService.name);
  private client: TelegramClient;
  private isConnected = false;
  private apiId: number;
  private apiHash: string;

  // Auth flow state
  private authClient: TelegramClient | null = null;
  private authPhoneCodeHash: string | null = null;

  private readonly phoneRegex = /\+998[\s\-.]?\d{2}[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}/g;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private leadsService: LeadsService,
    private monitoredGroupsService: MonitoredGroupsService,
    private smsService: SmsService,
    private botService: TelegramBotService,
  ) {
    this.apiId = parseInt(this.config.get('TELEGRAM_API_ID', '0'));
    this.apiHash = this.config.get('TELEGRAM_API_HASH', '');
  }

  async onModuleInit() {
    const sessionString = this.config.get('TELEGRAM_SESSION_STRING', '');

    if (!this.apiId || !this.apiHash || !sessionString) {
      this.logger.warn('Telegram userbot credentials not set, userbot disabled');
      return;
    }

    await this.connectWithSession(sessionString);
  }

  private async connectWithSession(sessionString: string) {
    try {
      const session = new StringSession(sessionString);
      this.client = new TelegramClient(session, this.apiId, this.apiHash, {
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

  // === SESSION AUTH FLOW (from Dashboard) ===

  async sendCode(phone: string) {
    try {
      const session = new StringSession('');
      this.authClient = new TelegramClient(session, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });

      await this.authClient.connect();

      const result = await this.authClient.invoke(
        new Api.auth.SendCode({
          phoneNumber: phone,
          apiId: this.apiId,
          apiHash: this.apiHash,
          settings: new Api.CodeSettings({}),
        }),
      );

      this.authPhoneCodeHash = (result as any).phoneCodeHash;

      return { success: true, message: 'Kod yuborildi' };
    } catch (error) {
      this.logger.error(`Send code error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async verifyCode(phone: string, code: string, password?: string) {
    if (!this.authClient || !this.authPhoneCodeHash) {
      return { success: false, message: 'Avval telefon raqam yuboring' };
    }

    try {
      try {
        await this.authClient.invoke(
          new Api.auth.SignIn({
            phoneNumber: phone,
            phoneCodeHash: this.authPhoneCodeHash,
            phoneCode: code,
          }),
        );
      } catch (err: any) {
        if (err.errorMessage === 'SESSION_PASSWORD_NEEDED' && password) {
          await this.authClient.signInWithPassword(
            { apiId: this.apiId, apiHash: this.apiHash },
            { password: async () => password, onError: async (e: any) => { throw e; return true; } } as any,
          );
        } else if (err.errorMessage === 'SESSION_PASSWORD_NEEDED') {
          return { success: false, message: '2FA parol kerak', requires2FA: true };
        } else {
          throw err;
        }
      }

      // Get session string
      const sessionString = this.authClient.session.save() as unknown as string;

      // Save to AppSettings
      await this.prisma.appSettings.upsert({
        where: { key: 'telegram_session_string' },
        update: { value: sessionString },
        create: { key: 'telegram_session_string', value: sessionString },
      });

      // Disconnect old client if exists
      if (this.client && this.isConnected) {
        await this.client.disconnect();
      }

      // Use this auth client as the main client
      this.client = this.authClient;
      this.isConnected = true;
      this.authClient = null;
      this.authPhoneCodeHash = null;

      // Setup message handlers
      await this.setupMessageHandler();

      this.logger.log('Telegram userbot session saved and connected');
      return { success: true, message: 'Session ulandi!', sessionString };
    } catch (error) {
      this.logger.error(`Verify code error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  // === MESSAGE HANDLERS ===

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

    const group = groups.find(g => g.telegramId === chatId || g.telegramId === `-100${chatId}`);
    if (!group) return;

    if (group.keywords && group.keywords.length > 0) {
      const lowerText = message.text.toLowerCase();
      const hasKeyword = group.keywords.some((kw: string) => lowerText.includes(kw.toLowerCase()));
      if (!hasKeyword) return;
    }

    const phones = message.text.match(this.phoneRegex);
    if (!phones || phones.length === 0) return;

    this.logger.log(`Found ${phones.length} phone(s) in group "${group.title}"`);

    for (const rawPhone of phones) {
      const phone = rawPhone.replace(/[\s\-.]/g, '');

      try {
        const lead = await this.leadsService.create({
          phone,
          source: LeadSource.TELEGRAM_GROUP,
          sourceGroup: group.title,
          sourceMessage: message.text.substring(0, 500),
        });

        await this.monitoredGroupsService.incrementLeadCount(group.telegramId);

        await this.botService.notifyNewLead({
          id: lead.id,
          phone: lead.phone,
          name: lead.name || undefined,
          source: lead.source,
          sourceGroup: lead.sourceGroup || undefined,
          sourceMessage: lead.sourceMessage || undefined,
        });

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
