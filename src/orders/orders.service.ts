import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderEntity } from './entities/order.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { OrderStatus } from 'src/utility/enums/order.enums';
import { AddressService } from 'src/address/address.service';
import { ProductsService } from 'src/products/products.service';
import { OrderItemEntity } from 'src/order-items/entities/order-item.entity';
import { AddressType } from 'src/utility/enums/address.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { buildPaginatedResponse } from 'src/common/pagination.response';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    private readonly userService: UsersService,

    private readonly addressService: AddressService,

    private readonly productService: ProductsService,

    private readonly dataSource: DataSource,
  ) {}
  async create(createOrderDto: CreateOrderDto, currentUser: UserEntity) {
    const order_user = await this.userService.findById(currentUser.user_id);
    if (!order_user) throw new NotFoundException('User not found');

    const order_address = await this.addressService.findOne(
      createOrderDto.address_id,
    );
    if (!order_address) throw new NotFoundException('Address not found');
    if (order_address.type !== AddressType.SHIPPING)
      throw new BadRequestException('Address is not a shipping address.');
    if (order_address.user.user_id !== currentUser.user_id)
      throw new UnauthorizedException('Access Denied');

    const productIds = createOrderDto.items.map(
      (product) => product.product_id,
    );
    const products = await this.productService.findBy({
      product_id: In(productIds),
      is_active: true,
    });

    if (products.length !== productIds.length)
      throw new NotFoundException('Some products are invalid or inactive.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;

      const orderItems: OrderItemEntity[] = [];

      for (const item of createOrderDto.items) {
        const product = products.find(
          (product) => product.product_id === item.product_id,
        );
        if (!product) throw new NotFoundException('Product not found');

        product.stock_quantity -= item.quantity;
        if (product.stock_quantity < 0)
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );

        const unitPrice = Number(product.price);
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        const orderItem = new OrderItemEntity();
        orderItem.product = product;
        orderItem.image_url = product.image_url;
        orderItem.quantity = item.quantity;
        orderItem.unit_price = unitPrice;
        orderItem.total_price = totalPrice;
        orderItem.product_snapshot = {
          name: product.name,
          image_url: product.image_url,
          price: product.price,
        };

        orderItems.push(orderItem);

        // Save updated product stock inside transaction
        await queryRunner.manager.save(product);
      }

      // create order here
      const order = new OrderEntity();
      order.user = order_user;
      order.items = orderItems;
      order.status = OrderStatus.PENDING;
      order.shipping_address = order_address;
      order.total_amount = totalAmount;

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return {
        data: {
          order_id: savedOrder.order_id,
          user: order_user.name,
          items: savedOrder.items?.map((item) => ({
            name: item.product.name,
            image_url: item.image_url,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
          total_amount: savedOrder.total_amount,
          status: savedOrder.status,
        },
        statusCode: HttpStatus.CREATED,
        message: 'Order created successfully.',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { order_id: id },
      relations: ['items', 'user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, totalCount] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return buildPaginatedResponse(
      data,
      totalCount,
      page,
      limit,
      'Orders fetched successfully',
    );
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return await this.orderRepository.save(order);
  }

  async cancelOrder(id: string) {
    const order = await this.findOne(id);
    order.status = OrderStatus.CANCELLED;
    return await this.orderRepository.save(order);
  }

  async remove(id: string) {
    return await this.orderRepository.softDelete({ order_id: id });
  }

  async markOrderAsPaid(orderId: string) {
    await this.orderRepository.update(orderId, {
      status: OrderStatus.PAID,
    });
  }

  async markOrderAsFailed(orderId: string) {
    await this.orderRepository.update(orderId, {
      status: OrderStatus.FAILED,
    });
  }
}
