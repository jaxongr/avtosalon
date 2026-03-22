import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get leads grouped by status (for Kanban board)' })
  findByStatus() {
    return this.leadsService.findByStatus();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID with full details' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req: any) {
    return this.leadsService.update(id, dto, req.user.id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to lead' })
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto, @Req() req: any) {
    return this.leadsService.addNote(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
