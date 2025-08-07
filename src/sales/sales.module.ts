import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SaleService } from './sales.service';
import { StockCheckService } from 'src/stock-check/stock-check.service';

@Module({
  controllers: [SalesController],
  providers: [SaleService, StockCheckService]
})
export class SalesModule {}
