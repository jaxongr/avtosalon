import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MonitoredGroupsService } from './monitored-groups.service';
import { AddGroupDto, UpdateGroupDto } from './dto/add-group.dto';

@ApiTags('Monitored Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitored-groups')
export class MonitoredGroupsController {
  constructor(private service: MonitoredGroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha guruhlar' })
  findAll() { return this.service.findAll(); }

  @Post()
  @ApiOperation({ summary: 'Guruh qo\'shish' })
  add(@Body() dto: AddGroupDto) {
    return this.service.addGroup(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Guruh yangilash' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Guruh o\'chirish' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
