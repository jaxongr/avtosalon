import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { LeadNotifyProcessor } from './processors/lead-notify.processor';
import { SmsSendProcessor } from './processors/sms-send.processor';
import { ReminderCheckProcessor } from './processors/reminder-check.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD', undefined),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'lead-notify' },
      { name: 'sms-send' },
      { name: 'reminder-check' },
    ),
  ],
  providers: [LeadNotifyProcessor, SmsSendProcessor, ReminderCheckProcessor],
  exports: [BullModule],
})
export class QueueModule {}
