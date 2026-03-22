import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddNoteDto {
  @ApiProperty({ example: 'Client is interested in Malibu 2024' })
  @IsString()
  note: string;
}
