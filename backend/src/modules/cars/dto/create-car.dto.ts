import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarCategory } from '@prisma/client';

export class CreateCarDto {
  @ApiProperty({ example: 'Chevrolet' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Malibu' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  @Min(1990)
  year: number;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: CarCategory, default: CarCategory.SEDAN })
  @IsEnum(CarCategory)
  @IsOptional()
  category?: CarCategory;

  @ApiProperty({ required: false, example: 'White' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false, example: 15000 })
  @IsNumber()
  @IsOptional()
  mileage?: number;

  @ApiProperty({ required: false, example: '2.0L Turbo' })
  @IsString()
  @IsOptional()
  engine?: string;

  @ApiProperty({ required: false, example: 'Automatic' })
  @IsString()
  @IsOptional()
  transmission?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videos?: string[];

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
