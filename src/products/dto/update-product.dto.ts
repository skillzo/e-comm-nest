import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsNumber, IsString, IsUrl, IsUUID } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  name: string;

  @IsUrl()
  image_url: string;

  @IsUUID()
  category_id: string;

  @IsString()
  description: string;
}

export class UpdatePriceDto {
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty()
  stock_quantity: number;
}
