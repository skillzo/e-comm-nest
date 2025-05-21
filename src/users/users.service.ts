import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

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
    return await this.usersRepository.findOneBy({ id });
  }

  // auth
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.usersRepository.update(id, updateUserDto);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  remove(id: string) {
    try {
      return this.usersRepository.delete(id);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async findUserWithPassword(id: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }
}
