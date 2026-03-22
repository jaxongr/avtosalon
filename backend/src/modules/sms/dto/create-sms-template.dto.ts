import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSmsTemplateDto {
  @ApiProperty({ example: 'Welcome Promo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Assalomu alaykum! Mashinangizni sotmoqchimisiz?' })
  @IsString()
  content: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
