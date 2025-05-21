import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('getAll')
  async findAll(): Promise<UserEntity[]> {
    try {
      return await this.usersService.findAll();
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('getById/:id')
  async getUserById(@Param('id') id: string) {
    try {
      return this.usersService.findOne(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.usersService.update(id, updateUserDto);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  //
  @Get('getProfile')
  async getProfile(@CurrentUser() currentUser: UserEntity) {
    return currentUser;
  }
}
