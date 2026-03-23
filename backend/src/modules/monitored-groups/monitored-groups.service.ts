import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MonitoredGroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.monitoredGroup.findMany({
      orderBy: { leadsCount: 'desc' },
      include: { _count: { select: { leads: true } } },
    });
  }

  async findActive() {
    return this.prisma.monitoredGroup.findMany({
      where: { isActive: true },
    });
  }

  async addGroup(data: { telegramId: string; title: string; type?: string }) {
    return this.prisma.monitoredGroup.upsert({
      where: { telegramId: data.telegramId },
      create: { telegramId: data.telegramId, title: data.title, type: data.type || 'GROUP' },
      update: { title: data.title },
    });
  }

  async update(id: string, data: { title?: string; isActive?: boolean }) {
    return this.prisma.monitoredGroup.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.monitoredGroup.delete({ where: { id } });
  }

  async incrementLeadCount(telegramId: string) {
    await this.prisma.monitoredGroup.update({
      where: { telegramId },
      data: { leadsCount: { increment: 1 } },
    }).catch(() => {});
  }

  async updateLastMessage(telegramId: string, msgId: number) {
    await this.prisma.monitoredGroup.update({
      where: { telegramId },
      data: { lastMessageId: msgId, lastMessageAt: new Date() },
    }).catch(() => {});
  }

  async updateLastScraped(telegramId: string) {
    await this.prisma.monitoredGroup.update({
      where: { telegramId },
      data: { lastScrapedAt: new Date() },
    }).catch(() => {});
  }
}
