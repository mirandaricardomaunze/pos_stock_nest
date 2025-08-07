import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsIn } from 'class-validator';

export class DashboardStatsDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  totalProducts: number;

  @ApiProperty({ example: 'R$ 5.430,00' })
  @IsString()
  todaySales: string;

  @ApiProperty({ enum: ['up', 'down', 'neutral'] })
  @IsIn(['up', 'down', 'neutral'])
  salesTrend: string;

  @ApiProperty({ example: '+8.5%' })
  @IsString()
  salesChange: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  lowStockItems: number;

  @ApiProperty({ enum: ['up', 'down', 'neutral'] })
  @IsIn(['up', 'down', 'neutral'])
  stockTrend: string;

  @ApiProperty({ example: '+3' })
  @IsString()
  stockChange: string;

  @ApiProperty({ example: '15.2%' })
  @IsString()
  growthRate: string;

  @ApiProperty({ enum: ['up', 'down', 'neutral'] })
  @IsIn(['up', 'down', 'neutral'])
  growthTrend: string;

  @ApiProperty({ example: '+1.1%' })
  @IsString()
  growthChange: string;

  @ApiProperty({example:"10"})
  @IsNumber()
  totalProfit:number;
}