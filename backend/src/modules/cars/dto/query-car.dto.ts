import { IsEnum, IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CarCategory } from '@prisma/client';

export class QueryCarDto {
  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false, enum: CarCategory })
  @IsEnum(CarCategory)
  @IsOptional()
  category?: CarCategory;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
