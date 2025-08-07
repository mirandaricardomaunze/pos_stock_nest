import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
  Max,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product ID', required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Product expiry date', required: false, type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @ApiProperty({ description: 'Product quantity', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Product barcode', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ description: 'Product reference', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: 'Product selling price', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @ApiProperty({ description: 'Product purchase price', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({ description: 'Product profit', required: false })
  @IsNumber()
  @IsOptional()
  profit?: number;

  @ApiProperty({ description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Product IVA percentage', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  iva?: number;

  @ApiProperty({ description: 'Category ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ description: 'Category name', required: false })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiProperty({ description: 'Supplier ID', required: false })
  @IsOptional()
  supplierId?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  userId?: number;
}
