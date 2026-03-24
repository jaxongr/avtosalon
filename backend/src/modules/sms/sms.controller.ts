import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SmsService } from './sms.service';

@ApiTags('SMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}

  @Get('logs')
  @ApiOperation({ summary: 'SMS tarixi' })
  getLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.smsService.getLogs(page || 1, limit || 50);
  }

  @Get('balance')
  @ApiOperation({ summary: 'SMS Gateway balans' })
  getBalance() {
    return this.smsService.getBalance();
  }

  @Get('status/:taskId')
  @ApiOperation({ summary: 'SMS holati tekshirish' })
  checkStatus(@Param('taskId') taskId: string) {
    return this.smsService.checkTaskStatus(taskId);
  }
}
