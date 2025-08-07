import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MovementService } from 'src/movements/movements.service';

@Module({
  providers: [ProductsService, MovementService],
  controllers: [ProductsController],
})
export class ProductsModule {}
