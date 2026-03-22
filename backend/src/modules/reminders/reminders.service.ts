import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private botService: TelegramBotService,
  ) {}

  async create(dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        leadId: dto.leadId,
        message: dto.message,
        dueAt: new Date(dto.dueAt),
      },
    });
  }

  async findByLead(leadId: string) {
    return this.prisma.reminder.findMany({
      where: { leadId },
      orderBy: { dueAt: 'asc' },
    });
  }

  async remove(id: string) {
    await this.prisma.reminder.delete({ where: { id } });
    return { message: 'Reminder deleted' };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkDueReminders() {
    const now = new Date();
    const dueReminders = await this.prisma.reminder.findMany({
      where: {
        isSent: false,
        dueAt: { lte: now },
      },
      include: {
        lead: true,
      },
    });

    for (const reminder of dueReminders) {
      try {
        await this.botService.sendReminder(reminder.leadId, reminder.message);

        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { isSent: true },
        });

        await this.prisma.leadActivity.create({
          data: {
            leadId: reminder.leadId,
            action: 'REMINDER_TRIGGERED',
            details: reminder.message,
          },
        });

        this.logger.log(`Reminder sent for lead ${reminder.leadId}`);
      } catch (error) {
        this.logger.error(`Reminder error: ${error.message}`);
      }
    }
  }
}
