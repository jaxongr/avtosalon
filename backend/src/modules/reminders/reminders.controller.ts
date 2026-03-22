import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a reminder for a lead' })
  create(@Body() dto: CreateReminderDto) {
    return this.remindersService.create(dto);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get reminders for a lead' })
  findByLead(@Param('leadId') leadId: string) {
    return this.remindersService.findByLead(leadId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder' })
  remove(@Param('id') id: string) {
    return this.remindersService.remove(id);
  }
}
