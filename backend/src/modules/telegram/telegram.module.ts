import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramClientService } from './telegram-client.service';
import { TelegramMonitorService } from './telegram-monitor.service';
import { TelegramScraperService } from './telegram-scraper.service';
import { TelegramController } from './telegram.controller';
import { LeadsModule } from '../leads/leads.module';
import { MonitoredGroupsModule } from '../monitored-groups/monitored-groups.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LeadsModule,
    MonitoredGroupsModule,
    SmsModule,
  ],
  controllers: [TelegramController],
  providers: [
    TelegramClientService,
    TelegramMonitorService,
    TelegramScraperService,
  ],
  exports: [TelegramClientService],
})
export class TelegramModule {}
