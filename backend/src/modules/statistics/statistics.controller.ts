import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboard() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get conversion funnel' })
  getFunnel() {
    return this.statisticsService.getConversionFunnel();
  }

  @Get('sms')
  @ApiOperation({ summary: 'Get SMS effectiveness stats' })
  getSmsStats() {
    return this.statisticsService.getSmsEffectiveness();
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get leads trend over time' })
  getTrend(@Query('days') days?: number) {
    return this.statisticsService.getLeadsTrend(days || 30);
  }
}
