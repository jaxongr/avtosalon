import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

@Processor('lead-notify')
export class LeadNotifyProcessor {
  private readonly logger = new Logger(LeadNotifyProcessor.name);

  @Process('notify-admin')
  async handleNotifyAdmin(job: Job<{ leadId: string; phone: string; source: string; sourceGroup?: string }>) {
    this.logger.log(`Processing lead notification for lead ${job.data.leadId}`);
    // Telegram bot notification is handled by TelegramBotService
    // This processor is for additional notification logic (email, webhook, etc.)
  }
}
