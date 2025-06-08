import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { OrdersService } from 'src/orders/orders.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/utility/enums/order.enums';
import { UsersService } from 'src/users/users.service';
import { PaymentStatus } from 'src/utility/enums/paymemt.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';
import { WebhookLogEntity } from './entities/webhookLog.entity';
import { buildPaginatedResponse } from 'src/common/pagination.response';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,

    @InjectRepository(WebhookLogEntity)
    private readonly webhookLogRepository: Repository<WebhookLogEntity>,

    private readonly orderService: OrdersService,

    private readonly usersService: UsersService,

    private httpService: HttpService,
  ) {}

  async initiatePayment(dto: CreatePaymentDto, user: UserEntity) {
    const order = await this.orderService.findOne(dto.order_id);
    if (!order) throw new NotFoundException('Order not found');

    const payment_user = await this.usersService.findById(user.user_id);
    if (!user) throw new NotFoundException('User not found');

    if (order.user.user_id !== user.user_id)
      throw new UnauthorizedException('Access denied');

    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException('Order already paid or cancelled');

    // create payment ref
    const paymentRef = `PS-${Date.now()}-${order.order_id}`;

    const payment = new PaymentEntity();
    payment.user = payment_user!;
    payment.order = order;
    payment.status = PaymentStatus.PENDING;
    payment.payment_provider = 'paystack';
    payment.payment_reference = paymentRef;
    payment.amount = order.total_amount;

    await this.paymentRepository.save(payment);

    // initiate payment with paystack

    const paystackUrl = `https://api.paystack.co/transaction/initialize`;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    try {
      const res = await this.httpService.axiosRef.post(
        paystackUrl,
        {
          email: payment_user?.email,
          amount: Math.round(order.total_amount * 100),
          reference: paymentRef,
          currency: 'NGN',
          callback_url: `${process.env.FRONTEND_URL}`,
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.data.data.authorization_url)
        throw new BadRequestException('Payment failed');

      if (res?.data)
        return {
          payment_reference: paymentRef,
          payment_link: res.data.data.authorization_url,
        };
    } catch (error) {
      throw new BadRequestException(error.response.data);
    }
  }

  async findPaymentByRef(ref: string): Promise<PaymentEntity> {
    const payemnt = await this.paymentRepository.findOne({
      where: { payment_reference: ref },
      relations: ['order', 'user'],
    });
    if (!payemnt) throw new NotFoundException('Payment not found');

    return payemnt;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, totalCount] = await this.paymentRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['order', 'user'],
      order: {
        created_at: 'DESC',
      },
    });

    return buildPaginatedResponse(
      data,
      totalCount,
      page,
      limit,
      'Payment fetched successfully',
    );
  }

  async markPaymentSuccess(
    payment: PaymentEntity,
    transactionId: string,
    amountPaid: number,
  ) {
    payment.status = PaymentStatus.SUCCESS;
    payment.transaction_id = transactionId;
    payment.amount = amountPaid;
    await this.paymentRepository.save(payment);
  }

  async paystackWebhook(req: Request) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] as string;
    const data = JSON.stringify(req.body);

    const expectedSig = createHmac('sha512', secretKey!)
      .update(data)
      .digest('hex');

    if (signature !== expectedSig)
      throw new BadRequestException('Invalid signature');

    const event: any = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const transactionId = event.data.id;
      const amountPaid = event.data.amount / 100;

      const payment = await this.findPaymentByRef(reference);
      if (!payment) throw new BadRequestException('Payment history not found');

      if (payment.status === PaymentStatus.SUCCESS)
        throw new BadRequestException(
          `Payment with ${reference} already marked as success`,
        );

      // update payment table
      await this.markPaymentSuccess(payment, transactionId, amountPaid);

      // update order table
      await this.orderService.markOrderAsPaid(payment.order.order_id);

      // update log table
      await this.webhookLogRepository.save({
        provider: 'paystack',
        payload: req.body,
      });

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Payment failed',
      };
    }

    if (event.event === 'charge.failed') {
      const reference = event.data.reference;

      const payment = await this.findPaymentByRef(reference);
      if (!payment) return;

      if (payment.status !== PaymentStatus.SUCCESS) {
        payment.status = PaymentStatus.FAILED;
        await this.paymentRepository.save(payment);

        await this.orderService.markOrderAsFailed(payment.order.order_id);
      }

      await this.webhookLogRepository.save({
        provider: 'paystack',
        payload: req.body,
      });

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Payment failed',
      };
    }
  }
}
