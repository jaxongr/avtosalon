import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MonitoredGroupsService } from './monitored-groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Monitored Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('monitored-groups')
export class MonitoredGroupsController {
  constructor(private service: MonitoredGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a Telegram group to monitor' })
  create(@Body() dto: CreateGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all monitored groups' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group settings' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove group from monitoring' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
