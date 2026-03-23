import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha sozlamalar' })
  getAll() { return this.service.getAll(); }

  @Put(':key')
  @ApiOperation({ summary: 'Sozlama yangilash' })
  set(@Param('key') key: string, @Body('value') value: string) {
    return this.service.set(key, value);
  }
}
