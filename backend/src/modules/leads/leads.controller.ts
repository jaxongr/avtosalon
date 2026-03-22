import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() dto: CreateLeadDto, @Req() req: any) {
    return this.leadsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads with filters' })
  findAll(@Query() query: QueryLeadDto) {
    return this.leadsService.findAll(query);
  }

  @Get('kanban')
  findByStatus() {
    return this.leadsService.findByStatus();
  }

  @Get('stats')
  getStats() {
    return this.leadsService.getStats();
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export leads to Excel' })
  async exportExcel(@Query() query: QueryLeadDto, @Res() res: Response) {
    const buffer = await this.leadsService.exportToExcel(query);
    const date = new Date().toISOString().split('T')[0];
    const city = query.city ? `_${query.city}` : '';
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=leads${city}_${date}.xlsx`,
    });
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req: any) {
    return this.leadsService.update(id, dto, req.user.id);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto, @Req() req: any) {
    return this.leadsService.addNote(id, dto, req.user.id);
  }

  @Post('cleanup/real-estate')
  @ApiOperation({ summary: 'Delete all real estate leads' })
  cleanupRealEstate() {
    return this.leadsService.cleanupRealEstateLeads();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
