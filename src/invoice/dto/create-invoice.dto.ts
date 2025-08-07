import { IsInt } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  orderId: number;
}
