import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Public } from 'src/utility/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
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

  @Get('history')
  findAll() {
    return this.paymentService.findAll();
  }

  @Post('webhook')
  @Public()
  async paystackWebhook(@Req() req: Request) {
    await this.paymentService.paystackWebhook(req);

    return {
      message: HttpStatus.ACCEPTED,
    };
  }
}

// Verify Payment	POST	/payment/verify
// Get My Payment History	GET	/payment/history
// Get All Payment (admin)	GET	/payment
// Get One Payment	GET	/payment/:id

// Refund Payment (admin)	POST	/payment/:id/refund
