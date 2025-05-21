import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserEntity) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    console.log('token', accessToken);
    return {
      access_token: accessToken,
      user_id: user.id,
    };
  }

  async signup(createUserDto: CreateUserDto): Promise<UserEntity> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    console.log('password', createUserDto.password);
    const user = this.usersService.create(createUserDto);
    return user;
  }

  // reset password

  // update password

  // forgot password

  // logout

  // refresh token

  // verify token

  // verify email

  // resend email
}
