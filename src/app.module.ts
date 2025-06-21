import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { BullModule } from '@nestjs/bullmq';
import middleware1, { MiddleWare2 } from './middleware/middleware1';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: seconds(2),
          limit: 5,
          blockDuration: seconds(3),
        },
        {
          name: 'long',
          ttl: seconds(10),
          limit: 20,
          blockDuration: seconds(10),
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(middleware1, MiddleWare2)
      .forRoutes({ method: RequestMethod.GET, path: 'users/getAll' });
  }
}
