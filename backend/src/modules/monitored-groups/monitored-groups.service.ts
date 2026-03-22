import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class MonitoredGroupsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGroupDto) {
    return this.prisma.monitoredGroup.create({ data: dto });
  }

  async findAll() {
    return this.prisma.monitoredGroup.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.monitoredGroup.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.monitoredGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async update(id: string, dto: UpdateGroupDto) {
    await this.findOne(id);
    return this.prisma.monitoredGroup.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.monitoredGroup.delete({ where: { id } });
    return { message: 'Group deleted' };
  }

  async incrementLeadCount(telegramId: string) {
    await this.prisma.monitoredGroup.updateMany({
      where: { telegramId },
      data: {
        leadsCount: { increment: 1 },
        lastChecked: new Date(),
      },
    });
  }
}
