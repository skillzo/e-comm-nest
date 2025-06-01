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

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
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
  providers: [],
})
export class AppModule {}
