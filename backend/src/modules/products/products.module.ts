import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { WarehousesController } from './warehouses.controller';

@Module({
  controllers: [ProductsController, WarehousesController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
