import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CallbackRequestsService } from './callback-requests.service';
import { CreateCallbackDto } from './dto/create-callback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Callback Requests')
@Controller('callback-requests')
export class CallbackRequestsController {
  constructor(private service: CallbackRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create callback request (from Mini App, no auth)' })
  create(@Body() dto: CreateCallbackDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all callback requests' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/handled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark callback as handled' })
  markHandled(@Param('id') id: string) {
    return this.service.markHandled(id);
  }
}
