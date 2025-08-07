import { Module } from '@nestjs/common';
import { StockCheckService } from './stock-check.service';
import { StockCheckController } from './stock-check.controller';

@Module({
  providers: [StockCheckService],
  controllers: [StockCheckController]
})
export class StockCheckModule {}
