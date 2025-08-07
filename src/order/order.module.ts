import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderGateway } from './orderWebSocket/order.getway';

@Module({
  providers: [OrderService, OrderGateway],
  exports: [OrderService], // se outro módulo for precisar
  
})
export class OrderModule {}