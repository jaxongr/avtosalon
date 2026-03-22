import { IsString, IsEnum, IsOptional, IsNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be UZ format: +998XXXXXXXXX' })
  phone: string;

  @ApiProperty({ required: false, example: 'Ali Valiyev' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: LeadSource, default: LeadSource.MANUAL })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sourceGroup?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sourceMessage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @IsString() @IsOptional() carBrand?: string;
  @IsString() @IsOptional() carModel?: string;
  @IsNumber() @IsOptional() carYear?: number;
  @IsString() @IsOptional() carPrice?: string;
  @IsString() @IsOptional() carColor?: string;
  @IsString() @IsOptional() carMileage?: string;
  @IsString() @IsOptional() carFuel?: string;
  @IsString() @IsOptional() carTransmission?: string;
  @IsString() @IsOptional() carDescription?: string;
  @IsString() @IsOptional() senderUsername?: string;
  @IsString() @IsOptional() senderName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  managerId?: string;
}
