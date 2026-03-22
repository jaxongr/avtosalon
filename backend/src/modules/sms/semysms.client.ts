import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SemySmsClient {
  private readonly logger = new Logger(SemySmsClient.name);
  private readonly token: string;
  private readonly device: string;

  constructor(private config: ConfigService) {
    this.token = this.config.get('SEMYSMS_TOKEN', '');
    this.device = this.config.get('SEMYSMS_DEVICE', '');
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
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
      this.logger.error(`SMS send error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
