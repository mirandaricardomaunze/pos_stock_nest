import { IsArray, ValidateNested, IsNumber, Min, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';


class SaleItemDTO {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDTO)
  items: SaleItemDTO[];
  @IsString()
  @IsOptional()
  clientName?: string;
  
   @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  change?: number;
}


