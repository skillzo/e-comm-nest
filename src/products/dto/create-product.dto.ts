import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { ProductImageEntity } from 'src/product-images/entities/product-image.entity';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  stock_quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsNotEmpty()
  @IsUrl()
  image_url: string;

  @IsNotEmpty()
  @IsUUID()
  category_id: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: ProductImageEntity[];
}
