import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.setting.findMany();
  }

  async get(key: string): Promise<string | null> {
    const s = await this.prisma.setting.findUnique({ where: { key } });
    return s?.value || null;
  }

  async set(key: string, value: string, description?: string) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value, description },
      update: { value },
    });
  }

  async seedDefaults() {
    const defaults = [
      { key: 'sms_enabled', value: 'false', description: 'SMS yuborish yoqilganmi' },
      { key: 'sms_template', value: 'Assalomu alaykum! Sizning {brand} {model} mashina e\'loningizni ko\'rdik. Eng yaxshi narx taklif qilamiz! Qo\'ng\'iroq qiling.', description: 'SMS shablon' },
      { key: 'scrape_interval_min', value: '10', description: 'Scrape intervali (daqiqa)' },
      { key: 'monitoring_active', value: 'true', description: 'Monitoring yoqilganmi' },
    ];
    for (const d of defaults) {
      await this.prisma.setting.upsert({
        where: { key: d.key },
        create: d,
        update: {},
      });
    }
  }
}
