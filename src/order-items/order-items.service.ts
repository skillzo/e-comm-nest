import { Injectable } from '@nestjs/common';
import { OrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from './entities/order-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly addressRepository: Repository<OrderItemEntity>,
  ) {}

  async create(createOrderItemDto: OrderItemDto) {
    const orderItem = new OrderItemEntity();
  }
}
