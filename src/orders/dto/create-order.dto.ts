import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: '6f0e7f66-f8f4-45d9-89cf-2f9d3c6a4707' })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product (minimum 1)',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: '6f0e7f66-f8f4-45d9-89cf-2f9d3c6a4707' })
  @IsUUID()
  address_id: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'List of items in the order',
    example: [
      {
        product_id: '6f0e7f66-f8f4-45d9-89cf-2f9d3c6a4707',
        quantity: 2,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
