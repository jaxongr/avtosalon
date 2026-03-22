import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LeadStatus, LeadSource } from '@prisma/client';

export class QueryLeadDto {
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

  @ApiProperty({ enum: LeadStatus, required: false })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ enum: LeadSource, required: false })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  dateTo?: string;
}
