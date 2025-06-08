import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from './entities/order-item.entity';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  imports: [TypeOrmModule.forFeature([OrderItemEntity])],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
