import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Initialize Payment	POST	/payment/initiate
  @Post('initiate')
  create(
    @Body() body: CreatePaymentDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.paymentService.initiatePayment(body, currentUser);
  }

  @Get('webhook')
  paystackWebhook(@Req() req: Request) {
    return this.paymentService.paystackWebhook(req);
  }
}

// Verify Payment	POST	/payment/verify
// Get My Payment History	GET	/payment/history
// Get All Payment (admin)	GET	/payment
// Get One Payment	GET	/payment/:id

// Refund Payment (admin)	POST	/payment/:id/refund
