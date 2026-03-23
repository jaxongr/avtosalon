import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
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
}
