import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AddressType } from 'src/utility/enums/address.enum';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('create')
  create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const payload = {
      ...createAddressDto,
      user: currentUser,
    };
    return this.addressService.create(payload);
  }

  // get all address (admin)
  @Get('getAll')
  findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.addressService.findAll(Number(page), Number(pageSize));
  }

  // getById
  @Get('getById/:id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  // get logged in user address
  @Get('getByUser')
  getByUser(@CurrentUser() currentUser: UserEntity) {
    return this.addressService.findByUser(currentUser);
  }

  //update address
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  // set as default (shipping)
  @Patch('setAsDefault/:id')
  setAsDefault(@Param('id') id: string) {
    return this.addressService.setAsDefault(id);
  }

  // set as billing
  @Patch('setAsDefault/:id')
  setAsBilling(@Param('id') id: string) {
    return this.addressService.setAsBilling(id);
  }

  // delete
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
