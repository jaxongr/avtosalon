import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import * as ExcelJS from 'exceljs';
import { AddNoteDto } from './dto/add-note.dto';
import { LeadStatus, LeadSource } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto, userId?: string) {
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

  async exportToExcel(query: QueryLeadDto): Promise<Buffer> {
    const { status, source, city, search, dateFrom, dateTo } = query;
    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
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

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { manager: { select: { fullName: true } } },
    });

    const workbook = new ExcelJS.Workbook();

    // Umumiy varaq
    const allSheet = workbook.addWorksheet('Barcha Leadlar');
    allSheet.columns = [
      { header: 'Telefon', key: 'phone', width: 16 },
      { header: 'Ism', key: 'name', width: 18 },
      { header: 'Shahar', key: 'city', width: 14 },
      { header: 'Mashina', key: 'car', width: 25 },
      { header: 'Narx', key: 'carPrice', width: 14 },
      { header: 'Yil', key: 'carYear', width: 8 },
      { header: 'Rang', key: 'carColor', width: 10 },
      { header: 'KPP', key: 'carTransmission', width: 10 },
      { header: 'Yoqilgi', key: 'carFuel', width: 10 },
      { header: 'Probeg', key: 'carMileage', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Manba guruh', key: 'sourceGroup', width: 22 },
      { header: 'Yuboruvchi', key: 'sender', width: 20 },
      { header: 'Menejer', key: 'manager', width: 16 },
      { header: 'Sana', key: 'date', width: 18 },
      { header: 'Xabar', key: 'message', width: 40 },
    ];

    // Header style
    allSheet.getRow(1).font = { bold: true };
    allSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B46C1' } };
    allSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const lead of leads) {
      allSheet.addRow({
        phone: lead.phone,
        name: lead.name || '',
        city: lead.city || '',
        car: [lead.carBrand, lead.carModel].filter(Boolean).join(' ') || '',
        carPrice: lead.carPrice || '',
        carYear: lead.carYear || '',
        carColor: lead.carColor || '',
        carTransmission: lead.carTransmission || '',
        carFuel: lead.carFuel || '',
        carMileage: lead.carMileage || '',
        status: lead.status,
        sourceGroup: lead.sourceGroup || '',
        sender: [lead.senderName, lead.senderUsername ? `@${lead.senderUsername}` : ''].filter(Boolean).join(' '),
        manager: (lead as any).manager?.fullName || '',
        date: lead.createdAt.toLocaleString('uz-UZ'),
        message: lead.sourceMessage || '',
      });
    }

    // Shahar bo'yicha alohida varaqlar
    const cities = [...new Set(leads.map(l => l.city).filter(Boolean))] as string[];
    for (const c of cities) {
      const cityLeads = leads.filter(l => l.city === c);
      const sheet = workbook.addWorksheet(c);
      sheet.columns = allSheet.columns.map(col => ({ ...col }));
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2DD4A8' } };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      for (const lead of cityLeads) {
        sheet.addRow({
          phone: lead.phone,
          name: lead.name || '',
          city: lead.city || '',
          car: [lead.carBrand, lead.carModel].filter(Boolean).join(' ') || '',
          carPrice: lead.carPrice || '',
          carYear: lead.carYear || '',
          carColor: lead.carColor || '',
          carTransmission: lead.carTransmission || '',
          carFuel: lead.carFuel || '',
          carMileage: lead.carMileage || '',
          status: lead.status,
          sourceGroup: lead.sourceGroup || '',
          sender: [lead.senderName, lead.senderUsername ? `@${lead.senderUsername}` : ''].filter(Boolean).join(' '),
          manager: (lead as any).manager?.fullName || '',
          date: lead.createdAt.toLocaleString('uz-UZ'),
          message: lead.sourceMessage || '',
        });
      }
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
