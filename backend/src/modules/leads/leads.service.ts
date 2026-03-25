import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryLeadsDto } from './dto/query-leads.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.LeadUncheckedCreateInput) {
    const lead = await this.prisma.lead.create({ data });
    this.logger.log(`Lead created: ${lead.phone} | ${lead.brand || ''} ${lead.model || ''} | ${lead.city || ''}`);
    return lead;
  }

  async isDuplicateToday(phone: string): Promise<boolean> {
    // Toshkent timezone (UTC+5) bo'yicha bugungi kunni hisoblash
    const now = new Date();
    const tashkentOffset = 5 * 60 * 60 * 1000; // +5 soat
    const tashkentNow = new Date(now.getTime() + tashkentOffset);
    const todayStart = new Date(Date.UTC(
      tashkentNow.getUTCFullYear(),
      tashkentNow.getUTCMonth(),
      tashkentNow.getUTCDate(),
    ));
    // UTC ga qaytarish: Toshkent 00:00 = UTC 19:00 (oldingi kun)
    const todayStartUTC = new Date(todayStart.getTime() - tashkentOffset);

    const exists = await this.prisma.lead.findFirst({
      where: { phone, createdAt: { gte: todayStartUTC } },
    });
    return !!exists;
  }

  async findAll(query: QueryLeadsDto) {
    const { brand, city, status, search, dateFrom, dateTo, page = 1, limit = 50 } = query;
    const where: Prisma.LeadWhereInput = {};

    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dateFrom) where.createdAt = { ...where.createdAt as any, gte: new Date(dateFrom) };
    if (dateTo) where.createdAt = { ...where.createdAt as any, lte: new Date(dateTo) };

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { sourceGroup: { select: { title: true } } },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        sourceGroup: { select: { title: true } },
        smsLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  private getTodayStartUTC(): Date {
    const now = new Date();
    const tashkentOffset = 5 * 60 * 60 * 1000;
    const tashkentNow = new Date(now.getTime() + tashkentOffset);
    const todayStart = new Date(Date.UTC(
      tashkentNow.getUTCFullYear(), tashkentNow.getUTCMonth(), tashkentNow.getUTCDate(),
    ));
    return new Date(todayStart.getTime() - tashkentOffset);
  }

  async getStats() {
    const todayStart = this.getTodayStartUTC();
    const [total, today, byBrand, byCity, byStatus] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.lead.groupBy({ by: ['brand'], _count: true, orderBy: { _count: { brand: 'desc' } }, take: 15 }),
      this.prisma.lead.groupBy({ by: ['city'], _count: true, orderBy: { _count: { city: 'desc' } }, take: 15 }),
      this.prisma.lead.groupBy({ by: ['status'], _count: true }),
    ]);
    return { total, today, byBrand, byCity, byStatus };
  }

  async remove(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }
}
