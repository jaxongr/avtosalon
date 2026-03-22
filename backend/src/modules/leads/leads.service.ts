import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { LeadStatus, LeadSource } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto, userId?: string) {
    // Check if lead with same phone from same source exists
    const existing = await this.prisma.lead.findFirst({
      where: { phone: dto.phone, source: dto.source || LeadSource.MANUAL },
    });
    if (existing) {
      throw new ConflictException('Lead with this phone already exists from this source');
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        source: dto.source || LeadSource.MANUAL,
      },
      include: { manager: { select: { id: true, fullName: true } } },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId,
        action: 'CREATED',
        details: `Lead created from ${lead.source}`,
      },
    });

    return lead;
  }

  async findAll(query: QueryLeadDto) {
    const { page = 1, limit = 20, status, source, managerId, search, city, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (managerId) where.managerId = managerId;
    if (city) where.city = city;
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          manager: { select: { id: true, fullName: true } },
          _count: { select: { smsMessages: true, activities: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByStatus() {
    const statuses = Object.values(LeadStatus);
    const result: Record<string, any[]> = {};

    for (const status of statuses) {
      result[status] = await this.prisma.lead.findMany({
        where: { status },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        include: {
          manager: { select: { id: true, fullName: true } },
        },
      });
    }

    return result;
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, fullName: true, username: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { id: true, fullName: true } } },
        },
        smsMessages: { orderBy: { createdAt: 'desc' } },
        reminders: { orderBy: { dueAt: 'asc' } },
        callbackRequests: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, userId?: string) {
    const lead = await this.findOne(id);

    const updated = await this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { manager: { select: { id: true, fullName: true } } },
    });

    // Log status change
    if (dto.status && dto.status !== lead.status) {
      await this.prisma.leadActivity.create({
        data: {
          leadId: id,
          userId,
          action: 'STATUS_CHANGED',
          details: `Status changed from ${lead.status} to ${dto.status}`,
        },
      });
    }

    // Log assignment change
    if (dto.managerId && dto.managerId !== lead.managerId) {
      await this.prisma.leadActivity.create({
        data: {
          leadId: id,
          userId,
          action: 'ASSIGNED',
          details: `Lead assigned to manager`,
        },
      });
    }

    return updated;
  }

  async addNote(id: string, dto: AddNoteDto, userId: string) {
    await this.findOne(id);

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        userId,
        action: 'NOTE_ADDED',
        details: dto.note,
      },
    });

    if (dto.note) {
      await this.prisma.lead.update({
        where: { id },
        data: { notes: dto.note },
      });
    }

    return { message: 'Note added' };
  }

  async getStats() {
    const [byStatus, bySource, total, today] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.lead.groupBy({
        by: ['source'],
        _count: true,
      }),
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return { byStatus, bySource, total, today };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted' };
  }
}
