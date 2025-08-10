import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  orderId: number;
}