import { Injectable } from '@nestjs/common';
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
}
