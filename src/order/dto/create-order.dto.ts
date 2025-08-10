import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateOrderDto{
  @ApiProperty()
  @IsInt()
  employeeId: number;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus; // padrão é PENDING, pode deixar opcional

  @ApiProperty()
  @IsOptional()
  @IsString()
  clientName : string;
   
  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentMethod?:string
}

class CreateOrderItemDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

}
