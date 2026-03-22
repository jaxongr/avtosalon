import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty()
  @IsString()
  leadId: string;

  @ApiProperty({ example: 'Your promo message here' })
  @IsString()
  message: string;
}
