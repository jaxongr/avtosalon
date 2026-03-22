import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: LeadStatus, required: false })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  interestedCarId?: string;
}
