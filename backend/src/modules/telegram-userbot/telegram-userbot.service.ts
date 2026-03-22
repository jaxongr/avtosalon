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
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TelegramUserbotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramUserbotService.name);
  private client: TelegramClient;
  private isConnected = false;
  private apiId: number;
  private apiHash: string;

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
    const groups = await this.monitoredGroupsService.findActive();
    if (groups.length === 0) {
      this.logger.warn('No active monitored groups found');
      return;
    }

    // Convert IDs to numbers for gramjs (remove -100 prefix for channels)
    const chatIds = groups.map(g => {
      const id = g.telegramId;
      if (id.startsWith('-100')) return BigInt(id);
      if (id.startsWith('-')) return parseInt(id);
      return parseInt(id);
    }).filter(id => id !== 0 && !isNaN(Number(id)));

    this.logger.log(`Monitoring ${groups.length} groups: ${groups.map(g => g.title).join(', ')}`);

    // Listen to ALL messages if chats list has issues
    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        try {
          await this.handleNewMessage(event, groups);
        } catch (error) {
          this.logger.error(`Message handler error: ${error.message}`);
        }
      },
      new NewMessage({}),
    );
  }

  private async handleNewMessage(event: NewMessageEvent, groups: any[]) {
    const message = event.message;
    if (!message.text) return;

    const rawChatId = message.chatId?.toString();
    if (!rawChatId) return;

    // Match chat ID in various formats: raw, -100prefix, negative
    const group = groups.find(g => {
      const gid = g.telegramId;
      return gid === rawChatId
        || gid === `-100${rawChatId}`
        || gid === `-${rawChatId}`
        || (gid.startsWith('-100') && gid.substring(4) === rawChatId)
        || (gid.startsWith('-') && gid.substring(1) === rawChatId);
    });
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
        const city = detectCity(group.title);
        const parsed = parseCarMessage(message.text);

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

        // Rasmlarni yuklash
        const carPhotos: string[] = [];
        try {
          if (message.media && (message.media as any).photo) {
            const buffer = await this.client.downloadMedia(message.media, {});
            if (buffer && Buffer.isBuffer(buffer)) {
              const uploadDir = join(process.cwd(), 'uploads', 'leads');
              await mkdir(uploadDir, { recursive: true });
              const filename = `${uuid()}.jpg`;
              await writeFile(join(uploadDir, filename), buffer);
              carPhotos.push(`/uploads/leads/${filename}`);
            }
          }
        } catch (err) {
          this.logger.debug(`Photo download skipped: ${(err as any).message}`);
        }

        const lead = await this.leadsService.create({
          phone,
          source: LeadSource.TELEGRAM_GROUP,
          sourceGroup: group.title,
          sourceMessage: message.text.substring(0, 500),
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
          carPhotos,
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
