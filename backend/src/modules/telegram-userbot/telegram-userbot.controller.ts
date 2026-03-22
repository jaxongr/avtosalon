import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TelegramUserbotService } from './telegram-userbot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SendCodeDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phone: string;
}

class VerifyCodeDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;
}

@ApiTags('Telegram Userbot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('telegram-userbot')
export class TelegramUserbotController {
  constructor(private userbotService: TelegramUserbotService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get userbot connection status' })
  getStatus() {
    return this.userbotService.getStatus();
  }

  @Post('send-code')
  @ApiOperation({ summary: 'Send verification code to phone' })
  sendCode(@Body() dto: SendCodeDto) {
    return this.userbotService.sendCode(dto.phone);
  }

  @Post('verify-code')
  @ApiOperation({ summary: 'Verify code and create session' })
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.userbotService.verifyCode(dto.phone, dto.code, dto.password);
  }

  @Get('my-groups')
  @ApiOperation({ summary: 'Get user Telegram groups/channels' })
  getMyGroups() {
    return this.userbotService.getMyGroups();
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh group monitoring' })
  refreshMonitoring() {
    return this.userbotService.refreshMonitoring();
  }

  @Post('add-all-groups')
  @ApiOperation({ summary: 'Add all groups/channels to monitoring' })
  addAllGroups() {
    return this.userbotService.addAllGroupsToMonitoring();
  }

  @Post('scrape-history')
  @ApiOperation({ summary: 'Scrape last 3 days messages from all groups' })
  scrapeHistory() {
    return this.userbotService.scrapeHistory(3);
  }
}
