import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { QueryCarDto } from './dto/query-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private carsService: CarsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new car' })
  create(@Body() dto: CreateCarDto) {
    return this.carsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all cars with filters' })
  findAll(@Query() query: QueryCarDto) {
    return this.carsService.findAll(query);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get active cars for public catalog (Mini App)' })
  findCatalog(@Query() query: QueryCarDto) {
    return this.carsService.findActive(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car by ID' })
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update car' })
  update(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return this.carsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete car' })
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}
