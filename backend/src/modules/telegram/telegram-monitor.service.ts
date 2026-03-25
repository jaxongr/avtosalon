import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TelegramClientService } from './telegram-client.service';
import { LeadsService } from '../leads/leads.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { SmsService } from '../sms/sms.service';
import { extractPhones } from '../../common/utils/phone-parser';
import { parseCarAd } from '../../common/utils/car-parser';
import { isCarAd } from '../../common/utils/message-filter';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { Raw } from 'telegram/events';
import { Api } from 'telegram';

@Injectable()
export class TelegramMonitorService implements OnModuleInit {
  private readonly logger = new Logger(TelegramMonitorService.name);
  private monitoredGroups: any[] = [];
  private handlerRegistered = false;

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
    if (this.handlerRegistered) return;

    const client = this.telegramClient.getClient();
    if (!client || !this.telegramClient.getIsConnected()) {
      this.logger.warn('Client not connected, handler not registered');
      return;
    }

    this.monitoredGroups = await this.groupsService.findActive();
    this.logger.log(`Monitoring ${this.monitoredGroups.length} groups`);

    // 1) NewMessage handler — guruhlar uchun
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

    // 2) Raw handler — kanal xabarlari uchun (UpdateNewChannelMessage)
    client.addEventHandler(
      async (update: Api.TypeUpdate) => {
        try {
          if (update instanceof Api.UpdateNewChannelMessage) {
            const msg = update.message;
            if (msg instanceof Api.Message && msg.message) {
              await this.handleRawMessage(msg);
            }
          }
        } catch (error) {
          this.logger.error(`Raw handler error: ${error.message}`);
        }
      },
    );

    this.handlerRegistered = true;
    this.logger.log('Event handlers registered (NewMessage + Raw channel updates)');
  }

  async refreshGroups() {
    this.monitoredGroups = await this.groupsService.findActive();
    this.logger.log(`Refreshed: monitoring ${this.monitoredGroups.length} groups`);

    // Agar handler hali register bo'lmagan bo'lsa — register qilish
    await this.setupHandler();

    return this.monitoredGroups.length;
  }

  private async handleRawMessage(msg: Api.Message) {
    const text = msg.message || '';
    if (!text) return;

    // Chat ID olish
    const peer = msg.peerId;
    let rawChatId = '';
    if (peer instanceof Api.PeerChannel) {
      rawChatId = `-100${peer.channelId}`;
    } else if (peer instanceof Api.PeerChat) {
      rawChatId = `-${peer.chatId}`;
    } else {
      return;
    }

    await this.processMessage(rawChatId, msg.id, text, msg.out || false);
  }

  private async handleMessage(event: NewMessageEvent) {
    const message = event.message;
    const text = message.text || message.message || '';
    if (!text) return;
    if (message.out) return;

    const rawChatId = message.chatId?.toString();
    if (!rawChatId) return;

    await this.processMessage(rawChatId, message.id, text, false);
  }

  private async processMessage(rawChatId: string, msgId: number, text: string, isOut: boolean) {
    if (isOut || !text) return;

    const group = this.findGroup(rawChatId);
    if (!group) return;

    await this.groupsService.updateLastMessage(group.telegramId, msgId);

    const parsed = parseCarAd(text);
    if (!isCarAd(text, parsed)) return;

    const phones = extractPhones(text);
    if (phones.length === 0) return;

    const mainPhone = phones[0];
    const isDuplicate = await this.leadsService.isDuplicate(mainPhone);
    if (isDuplicate) return;

    this.logger.log(`LIVE [${group.title}] ${mainPhone} | ${parsed.brand || ''} ${parsed.model || ''}`);

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
        sourceGroupId: group.id,
        sourceMsgId: msgId,
        notes: phones.length > 1 ? `Qo'shimcha: ${phones.slice(1).join(', ')}` : undefined,
      });

      await this.groupsService.incrementLeadCount(group.telegramId);
      this.smsService.autoSendPromo(lead.id).catch(() => {});
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
