import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('sms-send')
export class SmsSendProcessor {
  private readonly logger = new Logger(SmsSendProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process({ name: 'send-promo', concurrency: 2 })
  async handleSendPromo(job: Job<{ leadId: string }>) {
    this.logger.log(`Processing promo SMS for lead ${job.data.leadId}`);
    // Actual sending is delegated to SmsService.autoSendPromo
    // This is called from the lead creation flow
  }
}
