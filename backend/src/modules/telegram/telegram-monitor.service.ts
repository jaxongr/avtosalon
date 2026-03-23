import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TelegramClientService } from './telegram-client.service';
import { LeadsService } from '../leads/leads.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { SmsService } from '../sms/sms.service';
import { extractPhones } from '../../common/utils/phone-parser';
import { parseCarAd } from '../../common/utils/car-parser';
import { isCarAd } from '../../common/utils/message-filter';
import { NewMessage, NewMessageEvent } from 'telegram/events';

@Injectable()
export class TelegramMonitorService implements OnModuleInit {
  private readonly logger = new Logger(TelegramMonitorService.name);
  private monitoredGroups: any[] = [];

  constructor(
    private telegramClient: TelegramClientService,
    private leadsService: LeadsService,
    private groupsService: MonitoredGroupsService,
    private smsService: SmsService,
  ) {}

  async onModuleInit() {
    // Wait a bit for client to connect
    setTimeout(() => this.setupHandler(), 3000);
  }

  private async setupHandler() {
    const client = this.telegramClient.getClient();
    if (!client || !this.telegramClient.getIsConnected()) {
      this.logger.warn('Client not connected, handler not registered');
      return;
    }

    this.monitoredGroups = await this.groupsService.findActive();
    this.logger.log(`Monitoring ${this.monitoredGroups.length} groups`);

    // CRITICAL: Empty filter = get ALL messages (groups + channels)
    // Do NOT use { incoming: true } - it skips channel posts
    client.addEventHandler(
      async (event: NewMessageEvent) => {
        try {
          await this.handleMessage(event);
        } catch (error) {
          this.logger.error(`Handler error: ${error.message}`);
        }
      },
      new NewMessage({}),
    );
    this.logger.log('Event handler registered (all messages including channels)');
  }

  async refreshGroups() {
    this.monitoredGroups = await this.groupsService.findActive();
    this.logger.log(`Refreshed: monitoring ${this.monitoredGroups.length} groups`);
    return this.monitoredGroups.length;
  }

  private async handleMessage(event: NewMessageEvent) {
    const message = event.message;
    const text = message.text || message.message || '';
    if (!text) return;

    // Skip own outgoing messages
    if (message.out) return;

    const rawChatId = message.chatId?.toString();
    if (!rawChatId) return;

    const msgId = message.id;

    // Find matching monitored group
    const group = this.findGroup(rawChatId);
    if (!group) return;

    // Update group last message timestamp
    await this.groupsService.updateLastMessage(group.telegramId, msgId);

    // Parse car data
    const parsed = parseCarAd(text);

    // Filter: is this a car ad?
    if (!isCarAd(text, parsed)) {
      this.logger.debug(`Filtered out (not car ad) from "${group.title}": ${text.substring(0, 50)}`);
      return;
    }

    // Extract phones
    const phones = extractPhones(text);
    if (phones.length === 0) {
      this.logger.debug(`No phone found in car ad from "${group.title}": ${text.substring(0, 50)}`);
      return;
    }

    this.logger.log(`MSG [${group.title}] phones=${phones.length} brand=${parsed.brand} model=${parsed.model}`);

    // Process first phone as main lead
    const mainPhone = phones[0];
    const extraPhones = phones.slice(1);

    // Duplicate check: same phone today
    const isDuplicate = await this.leadsService.isDuplicateToday(mainPhone);
    if (isDuplicate) {
      this.logger.debug(`Duplicate: ${mainPhone} already exists today`);
      return;
    }

    // Get sender info
    let senderName: string | undefined;
    let senderUsername: string | undefined;
    try {
      const sender = await message.getSender() as any;
      if (sender) {
        senderUsername = sender.username || undefined;
        senderName = [sender.firstName, sender.lastName].filter(Boolean).join(' ') || undefined;
      }
    } catch {}

    // Create lead
    try {
      const lead = await this.leadsService.create({
        phone: mainPhone,
        rawPhone: phones.join(', '),
        rawMessage: text.substring(0, 2000),
        brand: parsed.brand,
        model: parsed.model,
        year: parsed.year,
        priceAmount: parsed.priceAmount,
        priceCurrency: parsed.priceCurrency,
        color: parsed.color,
        mileage: parsed.mileage,
        fuelType: parsed.fuelType,
        transmission: parsed.transmission,
        condition: parsed.condition,
        creditAvailable: parsed.creditAvailable,
        city: parsed.city,
        senderName,
        senderUsername,
        sourceGroupId: group.id,
        sourceMsgId: msgId,
        notes: extraPhones.length > 0 ? `Qo'shimcha: ${extraPhones.join(', ')}` : undefined,
      });

      await this.groupsService.incrementLeadCount(group.telegramId);

      // Auto-send SMS (fire and forget)
      this.smsService.autoSendPromo(lead.id).catch(e =>
        this.logger.error(`SMS error for ${lead.phone}: ${e.message}`),
      );
    } catch (error) {
      this.logger.error(`Lead create error: ${error.message}`);
    }
  }

  private findGroup(rawChatId: string) {
    return this.monitoredGroups.find(g => {
      if (!g.isActive) return false;
      const gid = g.telegramId;
      if (gid === rawChatId) return true;
      if (gid === `-100${rawChatId}`) return true;
      if (gid === `-${rawChatId}`) return true;
      const gidClean = gid.replace(/^-100/, '').replace(/^-/, '');
      if (gidClean === rawChatId) return true;
      return false;
    });
  }
}
