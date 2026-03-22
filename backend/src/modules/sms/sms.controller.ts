import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('SMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}

  // Templates
  @Post('templates')
  @ApiOperation({ summary: 'Create SMS template' })
  createTemplate(@Body() dto: CreateSmsTemplateDto) {
    return this.smsService.createTemplate(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all SMS templates' })
  findAllTemplates() {
    return this.smsService.findAllTemplates();
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update SMS template' })
  updateTemplate(@Param('id') id: string, @Body() dto: Partial<CreateSmsTemplateDto>) {
    return this.smsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete SMS template' })
  deleteTemplate(@Param('id') id: string) {
    return this.smsService.deleteTemplate(id);
  }

  // Send SMS
  @Post('send')
  @ApiOperation({ summary: 'Send SMS to a lead' })
  sendSms(@Body() dto: SendSmsDto) {
    return this.smsService.sendSmsToLead(dto);
  }

  // History
  @Get('history')
  @ApiOperation({ summary: 'Get SMS history' })
  getHistory(@Query('leadId') leadId?: string) {
    return this.smsService.getSmsHistory(leadId);
  }

  // Settings
  @Get('settings')
  @ApiOperation({ summary: 'Get SMS settings' })
  getSettings() {
    return this.smsService.getSmsSetting();
  }

  @Post('settings/toggle')
  @ApiOperation({ summary: 'Toggle SMS auto-send ON/OFF' })
  toggleSms(@Body('enabled') enabled: boolean) {
    return this.smsService.toggleSms(enabled);
  }
}
