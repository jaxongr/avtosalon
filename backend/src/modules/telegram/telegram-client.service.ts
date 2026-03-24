import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';

@Injectable()
export class TelegramClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramClientService.name);
  private client: TelegramClient | null = null;
  private isConnected = false;
  private apiId: number;
  private apiHash: string;
  private phoneCodeHash: string | null = null;
  private loginPhone: string | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiId = parseInt(this.config.get('TELEGRAM_API_ID', '0'));
    this.apiHash = this.config.get('TELEGRAM_API_HASH', '');
  }

  async onModuleInit() {
    let sessionString = this.config.get('TELEGRAM_SESSION_STRING', '');

    if (!sessionString) {
      const dbSession = await this.prisma.setting.findUnique({
        where: { key: 'telegram_session_string' },
      });
      if (dbSession) sessionString = dbSession.value;
    }

    if (!this.apiId || !this.apiHash || !sessionString) {
      this.logger.warn('Telegram session not configured, waiting for dashboard setup');
      return;
    }

    await this.connectWithSession(sessionString);
  }

  private async connectWithSession(sessionString: string) {
    try {
      const session = new StringSession(sessionString);
      this.client = new TelegramClient(session, this.apiId, this.apiHash, {
        connectionRetries: 5,
        autoReconnect: true,
        useWSS: false,
      });

      await this.client.connect();

      const me = await this.client.getMe() as any;
      this.logger.log(`Userbot connected as: ${me.firstName || me.username}`);

      // CRITICAL: Load ALL dialogs so gramjs receives updates from all chats
      const dialogs = await this.client.getDialogs({ limit: 500 });
      this.logger.log(`Dialogs loaded: ${dialogs.length} chats`);

      this.isConnected = true;

      // Save updated session back to DB
      const updatedSession = this.client.session.save() as unknown as string;
      await this.prisma.setting.upsert({
        where: { key: 'telegram_session_string' },
        create: { key: 'telegram_session_string', value: updatedSession },
        update: { value: updatedSession },
      });
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
    }
  }

  getClient(): TelegramClient | null {
    return this.client;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  // === Dashboard'dan session ulanish ===

  async sendCode(phone: string) {
    this.loginPhone = phone;
    const session = new StringSession('');
    this.client = new TelegramClient(session, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
    await this.client.connect();

    const result = await this.client.invoke(
      new Api.auth.SendCode({
        phoneNumber: phone,
        apiId: this.apiId,
        apiHash: this.apiHash,
        settings: new Api.CodeSettings({}),
      }),
    );
    this.phoneCodeHash = (result as any).phoneCodeHash;
    this.logger.log(`Code sent to ${phone}`);
    return { success: true, phoneCodeHash: this.phoneCodeHash };
  }

  async verifyCode(phone: string, code: string, password?: string) {
    if (!this.client) throw new Error('Avval sendCode chaqiring');

    try {
      await this.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: phone,
          phoneCodeHash: this.phoneCodeHash!,
          phoneCode: code,
        }),
      );
    } catch (err: any) {
      if (err.errorMessage === 'SESSION_PASSWORD_NEEDED' && password) {
        await this.client.signInWithPassword(
          { apiId: this.apiId, apiHash: this.apiHash },
          { password: async () => password, onError: async (e) => { throw e; } },
        );
      } else if (err.errorMessage === 'SESSION_PASSWORD_NEEDED') {
        return { success: false, needPassword: true };
      } else {
        throw err;
      }
    }

    const sessionString = this.client.session.save() as unknown as string;

    // Save session to DB
    await this.prisma.setting.upsert({
      where: { key: 'telegram_session_string' },
      create: { key: 'telegram_session_string', value: sessionString },
      update: { value: sessionString },
    });

    // Now connect properly
    await this.connectWithSession(sessionString);

    return { success: true, connected: this.isConnected };
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
      this.isConnected = false;
    }
  }
}
