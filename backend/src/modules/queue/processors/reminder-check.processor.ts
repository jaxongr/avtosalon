import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('reminder-check')
export class ReminderCheckProcessor {
  private readonly logger = new Logger(ReminderCheckProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('check-due')
  async handleCheckDue(job: Job) {
    const now = new Date();
    const dueReminders = await this.prisma.reminder.findMany({
      where: {
        isSent: false,
        dueAt: { lte: now },
      },
      include: {
        lead: { include: { manager: true } },
      },
    });

    this.logger.log(`Found ${dueReminders.length} due reminders`);

    for (const reminder of dueReminders) {
      await this.prisma.reminder.update({
        where: { id: reminder.id },
        data: { isSent: true },
      });

      await this.prisma.leadActivity.create({
        data: {
          leadId: reminder.leadId,
          action: 'REMINDER_SENT',
          details: reminder.message,
        },
      });
    }

    return { processed: dueReminders.length };
  }
}
