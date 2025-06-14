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
import { AuthRoles } from 'src/utility/decorators/roles.decorator';
import { Roles, UserStatus } from 'src/utility/enums/user.enum';
import { RolesGuard } from 'src/auth/guard/role.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get all users
  @AuthRoles(Roles.ADMIN)
  @ApiResponse({ status: 201, description: 'Users fetched succesfully ' })
  @Get('getAll')
  async findAll(): Promise<UserEntity[]> {
    try {
      return await this.usersService.findAll();
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  //  get user by id
  @Get('getById/:id')
  async getUserById(@Param('id') id: string) {
    try {
      return this.usersService.findOne(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  // update user details
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.usersService.update(id, updateUserDto);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  // soft delete user
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  // get user profile
  @Get('me')
  getProfile(@CurrentUser() currentUser: UserEntity) {
    return this.usersService.getCurrentUser(currentUser);
  }

  // update user password
  @Patch('updatePassword/:id')
  updatePassword(@Param('id') id: string, @Body() password: string) {
    return this.usersService.changePassword(id, password);
  }

  // toggle user status
  @Patch('toggleStatus/:id')
  toggleStatus(@Param('id') id: string, @Body() status: UserStatus) {
    return this.usersService.toggleStatus(id, status);
  }

  // @AuthRoles(Roles.ADMIN)
  @Patch('makeAdmin/:id')
  makeAdmin(@Param('id') id: string) {
    return this.usersService.makeAdmin(id);
  }
}
