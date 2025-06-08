import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { WebhookLogEntity } from './entities/webhookLog.entity';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, WebhookLogEntity]),
    OrdersModule,
    HttpModule,
    UsersModule,
  ],
})
export class PaymentModule {}
