import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create Order	POST	/orders/create
  @Post('create')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.ordersService.create(createOrderDto, currentUser);
  }

  // Get All Orders (admin)	GET	/orders
  @Get('getAll')
  findAll() {
    return this.ordersService.findAll();
  }
}

// Get My Orders	GET	/orders/my-orders
// Get One Order	GET	/orders/:id

// Update Order Status (admin)	PATCH	/orders/:id/status
// Cancel Order (user)	PATCH	/orders/:id/cancel
// Delete Order (admin)	DELETE	/orders/:id

// Export Orders CSV (admin)	GET	/orders/export
// Get Order History (user)	GET	/orders/history

// /orders/track/:orderId → order tracking (by status → shipped, delivered, etc.)
// /orders/:orderId/invoice → generate invoice PDF
