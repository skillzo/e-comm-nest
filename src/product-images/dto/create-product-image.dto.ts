import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty()
  @IsArray()
  image_url: string[];

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
