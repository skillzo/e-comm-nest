import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Provider } from 'src/utility/enums/user.enum';

interface UserProps {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: Provider;
  provider_id: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.is_active || !password)
      throw new BadRequestException('invalid email or password');
    const userPassword = await this.usersService.findUserWithPassword(
      user.user_id,
    );
    if (userPassword === null)
      throw new UnauthorizedException('Login with valid sso');

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
    if (!createUserDto.password) {
      throw new BadRequestException('password is required');
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersService.create(createUserDto);
    return user;
  }

  async googleLogin(user: UserProps) {
    const user_Info = await this.usersService.findByEmail(user.email);
    // create user using google info
    if (!user_Info) {
      const payload = {
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        provider: user.provider,
        provider_id: user.provider_id,
      };

      const new_user = await this.usersService.create(payload);
      const { password, ...payload_user } = new_user;
      return {
        message: 'User created successfully',
        user: payload_user,
      };
    }

    if (user_Info) {
      const payload = {
        email: user_Info.email,
        sub: user_Info.user_id,
        role: user_Info.role,
      };
      const accessToken = this.jwtService.sign(payload);
      return {
        access_token: accessToken,
        user_id: user_Info.user_id,
        role: user_Info.role,
      };
    }
  }
}

// reset password

// forgot password

// logout

// refresh token

// verify token

// verify email

// resend email
