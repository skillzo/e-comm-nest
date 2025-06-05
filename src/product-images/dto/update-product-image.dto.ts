import { PartialType } from '@nestjs/mapped-types';
import { CreateProductImageDto } from './create-product-image.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class UpdateProductImageDto {
  @IsNotEmpty()
  @IsUrl()
  image_url: string;

  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @IsUUID()
  @IsOptional()
  is_primary?: boolean;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}
