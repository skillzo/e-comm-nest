import { PartialType } from '@nestjs/mapped-types';
import { CreateProductImageDto } from './create-product-image.dto';
import {
  IsBoolean,
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

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}
