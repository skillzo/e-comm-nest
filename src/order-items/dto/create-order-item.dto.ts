import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  address_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto2)
  items: OrderItemDto2[];
}

export class OrderItemDto2 {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
