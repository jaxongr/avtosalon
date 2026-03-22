import { Module, forwardRef } from '@nestjs/common';
import { TelegramUserbotService } from './telegram-userbot.service';
import { TelegramUserbotController } from './telegram-userbot.controller';
import { LeadsModule } from '../leads/leads.module';
import { MonitoredGroupsModule } from '../monitored-groups/monitored-groups.module';
import { SmsModule } from '../sms/sms.module';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [
    forwardRef(() => LeadsModule),
    MonitoredGroupsModule,
    SmsModule,
    TelegramBotModule,
  ],
  controllers: [TelegramUserbotController],
  providers: [TelegramUserbotService],
  exports: [TelegramUserbotService],
})
export class TelegramUserbotModule {}
