import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  leadId: string;

  @ApiProperty({ example: 'Follow up with client about Malibu' })
  @IsString()
  message: string;

  @ApiProperty({ example: '2026-03-21T10:00:00Z' })
  @IsDateString()
  dueAt: string;
}
