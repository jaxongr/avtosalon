import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { QueryCarDto } from './dto/query-car.dto';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCarDto) {
    return this.prisma.car.create({ data: dto });
  }

  async findAll(query: QueryCarDto) {
    const { page = 1, limit = 20, category, search, isActive, isFeatured } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const car = await this.prisma.car.findUnique({ where: { id } });
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async findActive(query: QueryCarDto) {
    return this.findAll({ ...query, isActive: true });
  }

  async update(id: string, dto: UpdateCarDto) {
    await this.findOne(id);
    return this.prisma.car.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.car.delete({ where: { id } });
    return { message: 'Car deleted' };
  }
}
