import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { SigninDto } from './dto/authDto';

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
  async login(@Body() body: SigninDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return await this.authService.login(user);
  }
}
