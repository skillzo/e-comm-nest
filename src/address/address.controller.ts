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
import { AuthRoles } from 'src/utility/decorators/roles.decorator';
import { Roles } from 'src/utility/enums/user.enum';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('address')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('create')
  create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.addressService.create(createAddressDto, currentUser);
  }

  @AuthRoles(Roles.ADMIN)
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
  @Get('getByUser/:id')
  getByUser(@Param('id') id: string) {
    return this.addressService.findByUser(id);
  }

  @Get('getmyaddress')
  getMyAddress(@CurrentUser() currentUser: UserEntity) {
    return this.addressService.findByLoggedInUser(currentUser);
  }

  //update address
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.addressService.update(id, updateAddressDto, currentUser);
  }

  // set as default (shipping)
  @Patch('setAsDefault/:id')
  setAsDefault(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.addressService.setAsDefault(id, currentUser);
  }

  // set as billing
  @Patch('setAsBilling/:id')
  setAsBilling(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.addressService.setAsBilling(id, currentUser);
  }

  // delete
  @Delete('delete/:id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    await this.addressService.remove(id, currentUser);
  }
}
