import { Module } from '@nestjs/common';
import { CallbackRequestsService } from './callback-requests.service';
import { CallbackRequestsController } from './callback-requests.controller';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [TelegramBotModule],
  controllers: [CallbackRequestsController],
  providers: [CallbackRequestsService],
  exports: [CallbackRequestsService],
})
export class CallbackRequestsModule {}
