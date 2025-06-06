import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Roles, UserStatus } from 'src/utility/enums/user.enum';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  // healper functions
  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async findById(id: string) {
    return await this.usersRepository.findOneBy({ user_id: id });
  }

  // auth
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('email already exists');
    }
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersRepository.find();
    return users;
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async getCurrentUser(user: UserEntity) {
    const userObj = await this.findById(user.user_id);
    if (!userObj) {
      throw new NotFoundException();
    }
    return {
      data: userObj,
      statusCode: HttpStatus.OK,
      message: 'User found successfully',
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser = {
      ...user,
      ...updateUserDto,
    };

    return await this.usersRepository.update(id, updatedUser);
  }

  async softDelete(id: string) {
    try {
      return this.usersRepository.update(id, { is_active: false });
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async findUserWithPassword(id: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.user_id = :id', { id })
      .getOne();
  }

  async changePassword(id: string, password: string) {
    return await this.usersRepository.update(id, { password });
  }

  async toggleStatus(id: string, status: UserStatus) {
    let active: boolean;
    if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
      active = false;
    } else {
      active = true;
    }

    return await this.usersRepository.update(id, { is_active: active, status });
  }

  async makeAdmin(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    if (user.role.includes(Roles.ADMIN)) {
      throw new BadRequestException('user is already admin');
    }

    const newRole = [...user.role, Roles.ADMIN];
    await this.usersRepository.update(id, { role: newRole });

    return {
      role: newRole,
      user_id: id,
      message: 'User is now an admin',
    };
  }
}
