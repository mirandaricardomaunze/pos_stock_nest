import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReturnDto {
  @IsInt()
  saleId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  returnedBy: string;

  @IsString()
  @IsOptional()
  carPlate?: string;
}
