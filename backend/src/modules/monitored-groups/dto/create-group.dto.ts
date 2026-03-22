import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: '-1001234567890' })
  @IsString()
  telegramId: string;

  @ApiProperty({ example: 'Tashkent Auto Sales' })
  @IsString()
  title: string;

  @ApiProperty({ example: ['sotiladi', 'mashina', 'avto'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
