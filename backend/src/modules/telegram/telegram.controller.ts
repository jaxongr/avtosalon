import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TelegramClientService } from './telegram-client.service';
import { TelegramMonitorService } from './telegram-monitor.service';
import { TelegramScraperService } from './telegram-scraper.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { Api } from 'telegram';

@ApiTags('Telegram')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('telegram')
export class TelegramController {
  constructor(
    private clientService: TelegramClientService,
    private monitorService: TelegramMonitorService,
    private scraperService: TelegramScraperService,
    private groupsService: MonitoredGroupsService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Telegram holati' })
  getStatus() {
    return this.clientService.getStatus();
  }

  @Post('send-code')
  @ApiOperation({ summary: 'Telegram login - kod yuborish' })
  async sendCode(@Body('phone') phone: string) {
    return this.clientService.sendCode(phone);
  }

  @Post('verify-code')
  @ApiOperation({ summary: 'Telegram login - kodni tasdiqlash' })
  async verifyCode(
    @Body('phone') phone: string,
    @Body('code') code: string,
    @Body('password') password?: string,
  ) {
    return this.clientService.verifyCode(phone, code, password);
  }

  @Post('refresh-groups')
  @ApiOperation({ summary: 'Guruhlar ro\'yxatini yangilash' })
  async refreshGroups() {
    const count = await this.monitorService.refreshGroups();
    return { success: true, monitoring: count };
  }

  @Post('scrape-now')
  @ApiOperation({ summary: 'Hozir scrape qilish' })
  async scrapeNow(@Query('minutes') minutes?: number) {
    const result = await this.scraperService.scrape(minutes || 60);
    return result;
  }

  @Post('add-all-groups')
  @ApiOperation({ summary: 'Barcha guruhlarni monitoring qo\'shish' })
  async addAllGroups() {
    const client = this.clientService.getClient();
    if (!client) return { success: false, message: 'Client not connected' };

    const dialogs = await client.getDialogs({ limit: 500 });
    let added = 0;
    let skipped = 0;

    for (const dialog of dialogs) {
      const entity = dialog.entity as any;
      if (!entity) continue;

      const isGroup = entity.className === 'Channel' || entity.className === 'Chat';
      if (!isGroup) continue;

      const telegramId = `-100${entity.id}`;
      const title = entity.title || 'Unknown';

      try {
        const existing = await this.groupsService.addGroup({
          telegramId,
          title,
          type: entity.className === 'Channel' && entity.broadcast ? 'CHANNEL' : 'GROUP',
        });
        if (existing) added++;
      } catch {
        skipped++;
      }
    }

    await this.monitorService.refreshGroups();
    return { success: true, added, skipped, message: `${added} ta guruh qo'shildi` };
  }
}
