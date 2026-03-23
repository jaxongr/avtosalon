import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private token: string;
  private deviceId: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.token = this.config.get('SEMYSMS_TOKEN', '');
    this.deviceId = this.config.get('SEMYSMS_DEVICE', '');
  }

  async sendSms(leadId: string, phone: string, message: string): Promise<{ success: boolean; smsId?: string }> {
    const smsLog = await this.prisma.smsLog.create({
      data: { leadId, phone, message, status: 'PENDING' },
    });

    if (!this.token) {
      this.logger.warn('SEMYSMS_TOKEN not configured');
      await this.prisma.smsLog.update({ where: { id: smsLog.id }, data: { status: 'FAILED', response: 'No token' } });
      return { success: false, smsId: smsLog.id };
    }

    try {
      // Auto-detect device if not set
      if (!this.deviceId) {
        await this.detectDevice();
      }

      const resp = await axios.post('https://semysms.net/api/3/sms.php', {
        token: this.token,
        device: this.deviceId,
        phone,
        msg: message,
      });

      const success = resp.data?.code === 0;
      await this.prisma.smsLog.update({
        where: { id: smsLog.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          response: JSON.stringify(resp.data),
        },
      });

      if (success) {
        await this.prisma.lead.update({
          where: { id: leadId },
          data: { smsSent: true, smsSentAt: new Date() },
        });
      }

      this.logger.log(`SMS to ${phone}: ${success ? 'SENT' : 'FAILED'}`);
      return { success, smsId: smsLog.id };
    } catch (error) {
      this.logger.error(`SMS error: ${error.message}`);
      await this.prisma.smsLog.update({
        where: { id: smsLog.id },
        data: { status: 'FAILED', response: error.message },
      });
      return { success: false, smsId: smsLog.id };
    }
  }

  private async detectDevice() {
    try {
      const resp = await axios.get(`https://semysms.net/api/3/devices.php?token=${this.token}`);
      const devices = resp.data?.data || [];
      const active = devices.find((d: any) => !d.is_arhive && d.is_work && d.power);
      if (active) {
        this.deviceId = active.id.toString();
        this.logger.log(`SemySMS device detected: ${this.deviceId} (${active.device_name})`);
      }
    } catch (e) {
      this.logger.error(`Device detection failed: ${e.message}`);
    }
  }

  async autoSendPromo(leadId: string): Promise<{ success: boolean }> {
    // Check if SMS enabled
    const setting = await this.prisma.setting.findUnique({ where: { key: 'sms_enabled' } });
    if (setting?.value !== 'true') return { success: false };

    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.smsSent) return { success: false };

    // Get template
    const template = await this.prisma.setting.findUnique({ where: { key: 'sms_template' } });
    let message = template?.value || 'Assalomu alaykum! Mashina sotmoqchimisiz? Biz eng yaxshi narx taklif qilamiz!';

    // Replace placeholders
    message = message
      .replace('{brand}', lead.brand || 'mashina')
      .replace('{model}', lead.model || '')
      .replace('{name}', lead.senderName || '');

    return this.sendSms(leadId, lead.phone, message);
  }

  async getLogs(page = 1, limit = 50) {
    const [items, total] = await Promise.all([
      this.prisma.smsLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { lead: { select: { phone: true, brand: true, model: true } } },
      }),
      this.prisma.smsLog.count(),
    ]);
    return { items, total, page, limit };
  }
}
