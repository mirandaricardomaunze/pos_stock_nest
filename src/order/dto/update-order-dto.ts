import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  notes?: string;
}