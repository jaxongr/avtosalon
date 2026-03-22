import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCallbackDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be UZ format: +998XXXXXXXXX' })
  phone: string;

  @ApiProperty({ required: false, example: 'Ali' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  carId?: string;

  @ApiProperty({ required: false, example: 'I want to know more about this car' })
  @IsString()
  @IsOptional()
  message?: string;
}
