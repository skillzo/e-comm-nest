import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { dataSourceOptions } from 'db/dataSource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { PaymentModule } from './payment/payment.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { RolesGuard } from './auth/guard/role.guard';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(1),
          limit: 1,
        },
      ],
      errorMessage: 'Too Many Requests',
    }),
    UsersModule,
    AuthModule,
    AddressModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    OrderItemsModule,
    PaymentModule,
    ProductImagesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
