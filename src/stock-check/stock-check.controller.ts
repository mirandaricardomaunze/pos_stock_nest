import { Controller, Get, Query } from '@nestjs/common';
import { StockCheckService } from './stock-check.service';

@Controller('stock-check')
export class StockCheckController {
  constructor(private readonly stockCheckService: StockCheckService) {}

  @Get()
  async checkStock(
    @Query('productId') productId: number,
    @Query('userId') userId: number,
    @Query('companyId') companyId: number,
  ) {
    if (!productId || !userId || !companyId) {
      return { message: 'Parâmetros productId, userId e companyId são obrigatórios' };
    }

    return this.stockCheckService.checkStock(productId, userId, companyId);
  }
}
