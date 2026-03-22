import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { SemySmsClient } from './semysms.client';

@Module({
  imports: [HttpModule],
  controllers: [SmsController],
  providers: [SmsService, SemySmsClient],
  exports: [SmsService, SemySmsClient],
})
export class SmsModule {}
