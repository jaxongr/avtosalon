import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [ScheduleModule.forRoot(), TelegramBotModule],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
