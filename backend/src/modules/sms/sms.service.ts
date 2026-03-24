import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private apiKey: string;
  private gatewayUrl: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.config.get('SMS_GATEWAY_API_KEY', '');
    this.gatewayUrl = this.config.get('SMS_GATEWAY_URL', 'http://185.207.251.184:8086');
  }

  async sendSms(leadId: string, phone: string, message: string): Promise<{ success: boolean; smsId?: string; taskId?: string }> {
    const smsLog = await this.prisma.smsLog.create({
      data: { leadId, phone, message, status: 'PENDING' },
    });

    if (!this.apiKey) {
      this.logger.warn('SMS_GATEWAY_API_KEY not configured');
      await this.prisma.smsLog.update({ where: { id: smsLog.id }, data: { status: 'FAILED', response: 'No API key' } });
      return { success: false, smsId: smsLog.id };
    }

    try {
      const resp = await axios.post(
        `${this.gatewayUrl}/api/v1/sms/send`,
        { to: phone, message },
        { headers: { 'x-api-key': this.apiKey, 'Content-Type': 'application/json' } },
      );

      const success = resp.status === 201 || resp.data?.success;
      const taskId = resp.data?.taskId || resp.data?.id;

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

      this.logger.log(`SMS to ${phone}: ${success ? 'SENT' : 'FAILED'}${taskId ? ' taskId=' + taskId : ''}`);
      return { success, smsId: smsLog.id, taskId };
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      this.logger.error(`SMS error to ${phone}: ${errMsg}`);
      await this.prisma.smsLog.update({
        where: { id: smsLog.id },
        data: { status: 'FAILED', response: errMsg },
      });
      return { success: false, smsId: smsLog.id };
    }
  }

  async checkTaskStatus(taskId: string) {
    try {
      const resp = await axios.get(
        `${this.gatewayUrl}/api/v1/sms/status/${taskId}`,
        { headers: { 'x-api-key': this.apiKey } },
      );
      return resp.data;
    } catch (error) {
      return { error: error.message };
    }
  }

  async getBalance() {
    try {
      const resp = await axios.get(
        `${this.gatewayUrl}/api/v1/balance`,
        { headers: { 'x-api-key': this.apiKey } },
      );
      return resp.data;
    } catch (error) {
      return { error: error.message };
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
