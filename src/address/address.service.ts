import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';
import { Repository } from 'typeorm';
import { buildPaginatedResponse } from 'src/common/pagination.response';
import { CurrentUser } from 'src/utility/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { AddressType } from 'src/utility/enums/address.enum';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    const address = this.addressRepository.create(createAddressDto);

    return await this.addressRepository.save(address);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, totalCount] = await this.addressRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return buildPaginatedResponse(
      data,
      totalCount,
      page,
      limit,
      'Address fetched successfully',
    );
  }

  async findOne(id: string): Promise<AddressEntity> {
    const address = await this.addressRepository.findOneBy({ address_id: id });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async findByUser(user: UserEntity) {
    return await this.addressRepository.find({
      where: { user: { user_id: user.user_id } },
    });
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    return await this.addressRepository.update(id, updateAddressDto);
  }
  async setAsBilling(id: string) {
    return await this.addressRepository.update(id, {
      type: AddressType.BILLING,
    });
  }

  async setAsDefault(id: string) {
    return await this.addressRepository.update(id, { is_default: true });
  }

  async remove(id: string) {
    return await this.addressRepository.delete({ address_id: id });
  }
}

// [
//   {
//     "full_name": "Jane Doe",
//     "phone_number": "+2348012345678",
//     "country": "Nigeria",
//     "postal_code": "100001",
//     "street": "15 Admiralty Way",
//     "city": "Victoria Island",
//     "state": "Lagos",
//     "landmark": "Opposite Eko Hotel",
//     "is_default": true
//   },
//   {
//     "full_name": "Michael Johnson",
//     "phone_number": "+2348098765432",
//     "country": "Nigeria",
//     "postal_code": "500101",
//     "street": "42 Aba Road",
//     "city": "Port Harcourt",
//     "state": "Rivers",
//     "landmark": "Next to Mega Plaza",
//     "is_default": false
//   },
//   {
//     "full_name": "Aisha Bello",
//     "phone_number": "+2348032233445",
//     "country": "Nigeria",
//     "postal_code": "900108",
//     "street": "12 Gwarinpa Avenue",
//     "city": "Abuja",
//     "state": "FCT",
//     "landmark": "Close to NNPC filling station",
//     "is_default": false
//   },
//   {
//     "full_name": "Tunde Okafor",
//     "phone_number": "+2347011122233",
//     "country": "Nigeria",
//     "postal_code": "300105",
//     "street": "8 Sapele Road",
//     "city": "Benin City",
//     "state": "Edo",
//     "landmark": "Behind Benin Mall",
//     "is_default": false
//   },
//   {
//     "full_name": "Chinwe Umeh",
//     "phone_number": "+2348023344556",
//     "country": "Nigeria",
//     "postal_code": "400103",
//     "street": "27 Zik Avenue",
//     "city": "Enugu",
//     "state": "Enugu",
//     "landmark": "Near Polo Park Mall",
//     "is_default": false
//   }
// ]
