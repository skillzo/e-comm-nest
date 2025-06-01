import {
  BadRequestException,
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
    if (!user) throw new BadRequestException('invalid email or password');
    const userPassword = await this.usersService.findUserWithPassword(
      user.user_id,
    );
    const passwordMatch =
      userPassword && (await bcrypt.compare(password, userPassword.password));

    if (!passwordMatch) {
      throw new BadRequestException('invalid email or password');
    }

    const { password: pass, ...result } = user;
    return result;
  }

  async login(user: UserEntity) {
    const payload = { email: user.email, sub: user.user_id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      access_token: accessToken,
      user_id: user.user_id,
      role: user.role,
    };
  }

  async signup(createUserDto: CreateUserDto): Promise<UserEntity> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersService.create(createUserDto);
    return user;
  }

  // reset password

  // forgot password

  // logout

  // refresh token

  // verify token

  // verify email

  // resend email
}
