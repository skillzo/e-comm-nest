import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { SigninDto } from './dto/authDto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: CreateUserDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.authService.signup(body);
    const { password, ...res } = user;
    return res;
  }

  @Post('login')
  @ApiOperation({ summary: 'Google OAuth Login' })
  async login(@Body() body: SigninDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return await this.authService.login(user);
  }

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth2 Login' })
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<void> {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 Callback Handler' })
  async googleAuthRedirect(@Req() req: any) {
    const user = req.user;
    return this.authService.googleLogin(user);
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
