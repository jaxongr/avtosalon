import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(1);

    const [
      totalLeads,
      todayLeads,
      weekLeads,
      monthLeads,
      totalCars,
      activeCars,
      smsSent,
      smsToday,
      leadsByStatus,
      leadsBySource,
      recentLeads,
      managerPerformance,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.lead.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.car.count(),
      this.prisma.car.count({ where: { isActive: true } }),
      this.prisma.smsMessage.count({ where: { status: 'SENT' } }),
      this.prisma.smsMessage.count({ where: { status: 'SENT', createdAt: { gte: todayStart } } }),
      this.prisma.lead.groupBy({ by: ['status'], _count: true }),
      this.prisma.lead.groupBy({ by: ['source'], _count: true }),
      this.prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, phone: true, name: true, status: true, source: true, createdAt: true },
      }),
      this.prisma.lead.groupBy({
        by: ['managerId'],
        _count: true,
        where: { managerId: { not: null } },
      }),
    ]);

    return {
      overview: {
        totalLeads,
        todayLeads,
        weekLeads,
        monthLeads,
        totalCars,
        activeCars,
        smsSent,
        smsToday,
      },
      leadsByStatus: leadsByStatus.map(s => ({ status: s.status, count: s._count })),
      leadsBySource: leadsBySource.map(s => ({ source: s.source, count: s._count })),
      recentLeads,
      managerPerformance,
    };
  }

  async getConversionFunnel() {
    const statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'SOLD', 'LOST'];
    const funnel: { status: string; count: number }[] = [];

    for (const status of statuses) {
      const count = await this.prisma.lead.count({ where: { status: status as any } });
      funnel.push({ status, count });
    }

    return funnel;
  }

  async getSmsEffectiveness() {
    const [total, sent, delivered, failed] = await Promise.all([
      this.prisma.smsMessage.count(),
      this.prisma.smsMessage.count({ where: { status: 'SENT' } }),
      this.prisma.smsMessage.count({ where: { status: 'DELIVERED' } }),
      this.prisma.smsMessage.count({ where: { status: 'FAILED' } }),
    ]);

    return { total, sent, delivered, failed };
  }

  async getLeadsTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const leads = await this.prisma.lead.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trend: Record<string, number> = {};
    for (const lead of leads) {
      const date = lead.createdAt.toISOString().split('T')[0];
      trend[date] = (trend[date] || 0) + 1;
    }

    return Object.entries(trend).map(([date, count]) => ({ date, count }));
  }
}
