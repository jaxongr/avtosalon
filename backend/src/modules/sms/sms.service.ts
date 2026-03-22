import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SemySmsClient } from './semysms.client';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { SmsStatus } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private prisma: PrismaService,
    private semySms: SemySmsClient,
  ) {}

  // Template CRUD
  async createTemplate(dto: CreateSmsTemplateDto) {
    if (dto.isDefault) {
      await this.prisma.smsTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.smsTemplate.create({ data: dto });
  }

  async findAllTemplates() {
    return this.prisma.smsTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateTemplate(id: string, dto: Partial<CreateSmsTemplateDto>) {
    if (dto.isDefault) {
      await this.prisma.smsTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.smsTemplate.update({ where: { id }, data: dto });
  }

  async deleteTemplate(id: string) {
    await this.prisma.smsTemplate.delete({ where: { id } });
    return { message: 'Template deleted' };
  }

  // SMS sending
  async sendSmsToLead(dto: SendSmsDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    // Check rate limit
    const recentSms = await this.prisma.smsMessage.findFirst({
      where: {
        phone: lead.phone,
        status: { in: [SmsStatus.SENT, SmsStatus.DELIVERED] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentSms) {
      return { message: 'SMS already sent to this number within 24 hours', skipped: true };
    }

    const smsRecord = await this.prisma.smsMessage.create({
      data: {
        leadId: dto.leadId,
        phone: lead.phone,
        message: dto.message,
        status: SmsStatus.PENDING,
      },
    });

    const result = await this.semySms.sendSms(lead.phone, dto.message);

    await this.prisma.smsMessage.update({
      where: { id: smsRecord.id },
      data: {
        status: result.success ? SmsStatus.SENT : SmsStatus.FAILED,
        semysmsId: result.id,
        error: result.error,
        sentAt: result.success ? new Date() : null,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: dto.leadId,
        action: result.success ? 'SMS_SENT' : 'SMS_FAILED',
        details: result.success ? `SMS sent: ${dto.message.substring(0, 50)}...` : `SMS failed: ${result.error}`,
      },
    });

    return { success: result.success, smsId: smsRecord.id };
  }

  async autoSendPromo(leadId: string) {
    // Check if SMS is enabled
    const setting = await this.prisma.appSettings.findUnique({
      where: { key: 'sms_enabled' },
    });
    if (setting?.value !== 'true') return;

    const template = await this.prisma.smsTemplate.findFirst({
      where: { isDefault: true, isActive: true },
    });
    if (!template) return;

    return this.sendSmsToLead({
      leadId,
      message: template.content,
    });
  }

  async getSmsHistory(leadId?: string) {
    const where: any = {};
    if (leadId) where.leadId = leadId;
    return this.prisma.smsMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { lead: { select: { id: true, phone: true, name: true } } },
    });
  }

  // Settings
  async getSmsSetting() {
    const setting = await this.prisma.appSettings.findUnique({
      where: { key: 'sms_enabled' },
    });
    return { enabled: setting?.value === 'true' };
  }

  async toggleSms(enabled: boolean) {
    await this.prisma.appSettings.upsert({
      where: { key: 'sms_enabled' },
      update: { value: String(enabled) },
      create: { key: 'sms_enabled', value: String(enabled) },
    });
    return { enabled };
  }
}
