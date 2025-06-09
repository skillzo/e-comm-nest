import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Public } from 'src/utility/decorators/public.decorator';
import { AuthRoles } from 'src/utility/decorators/roles.decorator';
import { Roles } from 'src/utility/enums/user.enum';

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

  // Get All Payment (admin)	GET	/payment
  @AuthRoles(Roles.ADMIN)
  @Get('history')
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('history/:id')
  findById(@Param('id') id: string) {
    return this.paymentService.findById(id);
  }

  // Get One Payment	GET	/payment/:id
  @Post('webhook')
  @Public()
  async paystackWebhook(@Req() req: Request) {
    await this.paymentService.paystackWebhook(req);

    return {
      message: HttpStatus.ACCEPTED,
    };
  }

  // Verify Payment	POST	/payment/verify
  @Post('verify')
  async verifyPaymentWithPaystack(@Body('reference') reference: string) {
    return this.paymentService.verifyPaymentWithPaystack(reference);
  }

  // Get My Payment History	GET	/payment/history
  @Get('history/me')
  getMyPaymentHistory(@CurrentUser() currentUser: UserEntity) {
    return this.paymentService.getMyPaymentHistory(currentUser);
  }

  // webhook log
  @Get('webhook/log')
  getWebhookLog(
    @Param('page') page: number = 1,
    @Param('pageSize') limit: number = 10,
  ) {
    return this.paymentService.getWebhookLog(page, limit);
  }

  // Refund Payment	POST	/payment/:id/refund
}
