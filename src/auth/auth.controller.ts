import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
    try {
      const user = await this.authService.signup(body);
      const { password, ...res } = user;
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Post('login')
  async login(@Body() body: SigninDto) {
    try {
      const user = await this.authService.validateUser(
        body.email,
        body.password,
      );
      console.log(user);
      return;
      // return this.authService.login(user);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
