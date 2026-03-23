import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LeadsService } from './leads.service';
import { QueryLeadsDto } from './dto/query-leads.dto';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha leadlar' })
  findAll(@Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistika' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lead detail' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Lead o\'chirish' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
