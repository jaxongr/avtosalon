import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SemySmsClient implements OnModuleInit {
  private readonly logger = new Logger(SemySmsClient.name);
  private readonly token: string;
  private device: string;

  constructor(private config: ConfigService) {
    this.token = this.config.get('SEMYSMS_TOKEN', '');
    this.device = this.config.get('SEMYSMS_DEVICE', '');
  }

  async onModuleInit() {
    if (!this.token) {
      this.logger.warn('SEMYSMS_TOKEN not set');
      return;
    }

    // Device ID bo'lmasa avtomatik topish
    if (!this.device) {
      await this.autoDetectDevice();
    }
  }

  private async autoDetectDevice() {
    try {
      const url = `https://semysms.net/api/3/devices.php?token=${this.token}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 0 && data.list && data.list.length > 0) {
        // Birinchi aktiv device ni olish
        const activeDevice = data.list.find((d: any) => d.is_online === 1) || data.list[0];
        this.device = activeDevice.id.toString();
        this.logger.log(`SemySMS device auto-detected: ${this.device} (${activeDevice.title || activeDevice.phone})`);
      } else {
        this.logger.warn('No SemySMS devices found');
      }
    } catch (error) {
      this.logger.error(`SemySMS device detect error: ${(error as any).message}`);
    }
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.token || !this.device) {
      return { success: false, error: 'SemySMS not configured' };
    }

    try {
      const url = new URL('https://semysms.net/api/3/sms.php');
      url.searchParams.set('token', this.token);
      url.searchParams.set('device', this.device);
      url.searchParams.set('phone', phone);
      url.searchParams.set('msg', message);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.code === 0) {
        this.logger.log(`SMS sent to ${phone}`);
        return { success: true, id: data.id?.toString() };
      }

      this.logger.error(`SMS failed to ${phone}: ${data.error}`);
      return { success: false, error: data.error || 'Unknown error' };
    } catch (error) {
      this.logger.error(`SMS send error: ${(error as any).message}`);
      return { success: false, error: (error as any).message };
    }
  }

  async getDevices() {
    if (!this.token) return { success: false, devices: [] };
    try {
      const url = `https://semysms.net/api/3/devices.php?token=${this.token}`;
      const response = await fetch(url);
      const data = await response.json();
      return { success: true, devices: data.list || [], activeDevice: this.device };
    } catch (error) {
      return { success: false, devices: [], error: (error as any).message };
    }
  }
}
