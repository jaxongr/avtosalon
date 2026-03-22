import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadsService } from '../leads/leads.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { SmsService } from '../sms/sms.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { LeadSource } from '@prisma/client';
import { detectCity } from '../../common/utils/city-detector';
import { parseCarMessage } from '../../common/utils/message-parser';

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

  private authClient: TelegramClient | null = null;
  private authPhoneCodeHash: string | null = null;
  private messageHandler: ((event: NewMessageEvent) => Promise<void>) | null = null;
  private monitoredGroups: any[] = [];

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
    // Try .env first, then DB
    let sessionString = this.config.get('TELEGRAM_SESSION_STRING', '');

    if (!sessionString) {
      const dbSession = await this.prisma.appSettings.findUnique({
        where: { key: 'telegram_session_string' },
      });
      if (dbSession) sessionString = dbSession.value;
    }

    if (!this.apiId || !this.apiHash || !sessionString) {
      this.logger.warn('Telegram userbot session not found, waiting for dashboard connection');
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

  // === SESSION AUTH FLOW ===

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

      const sessionString = this.authClient.session.save() as unknown as string;

      await this.prisma.appSettings.upsert({
        where: { key: 'telegram_session_string' },
        update: { value: sessionString },
        create: { key: 'telegram_session_string', value: sessionString },
      });

      if (this.client && this.isConnected) {
        await this.client.disconnect();
      }

      this.client = this.authClient;
      this.isConnected = true;
      this.authClient = null;
      this.authPhoneCodeHash = null;

      await this.setupMessageHandler();

      this.logger.log('Telegram userbot session saved and connected');
      return { success: true, message: 'Session ulandi!' };
    } catch (error) {
      this.logger.error(`Verify code error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  // === GET USER'S GROUPS/CHANNELS ===

  async getMyGroups() {
    if (!this.client || !this.isConnected) {
      return { success: false, message: 'Userbot ulanmagan', groups: [] };
    }

    try {
      const dialogs = await this.client.getDialogs({ limit: 500 });
      const groups = dialogs
        .filter((d: any) => d.isGroup || d.isChannel)
        .map((d: any) => {
          let chatId = d.id?.toString() || '';
          const entity = d.entity as any;
          const className = entity?.className || '';

          // Channel va supergroup uchun -100 prefix
          if (className === 'Channel' || className === 'ChannelForbidden') {
            chatId = `-100${entity.id}`;
          } else if (className === 'Chat' || className === 'ChatForbidden') {
            chatId = `-${entity.id}`;
          }

          // megagroup = supergroup (guruh), broadcast = kanal
          const isSupergroup = !!(entity?.megagroup);
          const isBroadcast = !!(entity?.broadcast);
          const isBasicGroup = className === 'Chat';

          return {
            id: chatId,
            title: d.title || d.name || 'Nomsiz',
            isGroup: isBasicGroup || isSupergroup,
            isChannel: isBroadcast,
            type: isBroadcast ? 'Kanal' : isSupergroup ? 'Supergroup' : isBasicGroup ? 'Guruh' : 'Noma\'lum',
            participantsCount: entity?.participantsCount || 0,
            username: entity?.username || null,
          };
        });

      return { success: true, groups, total: groups.length };
    } catch (error) {
      this.logger.error(`Get groups error: ${error.message}`);
      return { success: false, message: error.message, groups: [] };
    }
  }

  // === ADD ALL GROUPS TO MONITORING ===

  async addAllGroupsToMonitoring() {
    if (!this.client || !this.isConnected) {
      return { success: false, message: 'Userbot ulanmagan' };
    }

    const result = await this.getMyGroups();
    if (!result.success) return result;

    let added = 0;
    let skipped = 0;
    const defaultKeywords = ['sotiladi', 'mashina', 'avto', 'sotuv', 'sotaman', 'narx', 'narxi', 'продам', 'продаю', 'машина', 'авто'];

    for (const group of result.groups) {
      try {
        const existing = await this.prisma.monitoredGroup.findUnique({
          where: { telegramId: group.id },
        });
        if (existing) {
          skipped++;
          continue;
        }
        await this.prisma.monitoredGroup.create({
          data: {
            telegramId: group.id,
            title: group.title,
            keywords: defaultKeywords,
            isActive: true,
          },
        });
        added++;
      } catch {
        skipped++;
      }
    }

    // Monitoringni qayta boshlash
    await this.setupMessageHandler();

    return { success: true, message: `${added} ta guruh qo'shildi, ${skipped} ta o'tkazib yuborildi`, added, skipped };
  }

  // === REFRESH MONITORING ===

  async refreshMonitoring() {
    if (!this.client || !this.isConnected) {
      return { success: false, message: 'Userbot ulanmagan' };
    }

    await this.setupMessageHandler();
    return { success: true, message: 'Monitoring yangilandi' };
  }

  // === MESSAGE HANDLERS ===

  private async setupMessageHandler() {
    // Oldingi handler'ni olib tashlash
    if (this.messageHandler) {
      this.client.removeEventHandler(this.messageHandler, new NewMessage({}));
      this.messageHandler = null;
    }

    this.monitoredGroups = await this.monitoredGroupsService.findActive();
    if (this.monitoredGroups.length === 0) {
      this.logger.warn('No active monitored groups found');
      return;
    }

    this.logger.log(`Monitoring ${this.monitoredGroups.length} groups`);

    // Yangi handler yaratish
    this.messageHandler = async (event: NewMessageEvent) => {
      try {
        await this.handleNewMessage(event, this.monitoredGroups);
      } catch (error) {
        this.logger.error(`Message handler error: ${error.message}`);
      }
    };

    // gramjs event handler - barcha incoming xabarlarni tinglash
    this.client.addEventHandler(this.messageHandler, new NewMessage({}));
    this.logger.log('Event handler registered for all chats');
  }

  private async handleNewMessage(event: NewMessageEvent, groups: any[]) {
    const message = event.message;
    const text = message.text || message.message || '';
    if (!text) return;

    const rawChatId = message.chatId?.toString();
    if (!rawChatId) return;

    // Har bir xabarni log qilish
    this.logger.log(`MSG from chat ${rawChatId}: ${text.substring(0, 60)}`);

    // Monitored guruhga tegishli ekanini tekshirish
    const group = groups.find(g => {
      const gid = g.telegramId;
      // Barcha formatlarni solishtirish
      if (gid === rawChatId) return true;
      if (gid === `-100${rawChatId}`) return true;
      if (gid === `-${rawChatId}`) return true;
      // gid = -1001234, rawChatId = 1234
      const gidNum = gid.replace(/^-100/, '').replace(/^-/, '');
      if (gidNum === rawChatId) return true;
      return false;
    });

    if (!group) {
      // Guruh topilmadi - bu chat monitoring ro'yxatida yo'q
      return;
    }

    this.logger.log(`Message matched group "${group.title}" (${rawChatId})`);

    if (group.keywords && group.keywords.length > 0) {
      const lowerText = text.toLowerCase();
      const hasKeyword = group.keywords.some((kw: string) => lowerText.includes(kw.toLowerCase()));
      if (!hasKeyword) return;
    }

    const phones = text.match(this.phoneRegex);
    if (!phones || phones.length === 0) return;

    this.logger.log(`Found ${phones.length} phone(s) in group "${group.title}"`);

    for (const rawPhone of phones) {
      const phone = rawPhone.replace(/[\s\-.]/g, '');

      try {
        const city = detectCity(group.title);

        // Sender ma'lumotlari
        let senderUsername: string | undefined;
        let senderName: string | undefined;
        try {
          const sender = await message.getSender() as any;
          if (sender) {
            senderUsername = sender.username || undefined;
            senderName = [sender.firstName, sender.lastName].filter(Boolean).join(' ') || undefined;
          }
        } catch {}

        // Xabar matnidan mashina ma'lumotlarini parse qilish
        const parsed = parseCarMessage(text);

        const lead = await this.leadsService.create({
          phone,
          source: LeadSource.TELEGRAM_GROUP,
          sourceGroup: group.title,
          sourceMessage: text.substring(0, 500),
          city,
          carBrand: parsed.carBrand || undefined,
          carModel: parsed.carModel || undefined,
          carYear: parsed.carYear || undefined,
          carPrice: parsed.carPrice || undefined,
          carColor: parsed.carColor || undefined,
          carMileage: parsed.carMileage || undefined,
          carFuel: parsed.carFuel || undefined,
          carTransmission: parsed.carTransmission || undefined,
          carDescription: parsed.carDescription || undefined,
          senderUsername,
          senderName,
        } as any);

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
    }
  }
}
