import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post('create')
  create(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productImagesService.create(createProductImageDto);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductImageDto) {
    return this.productImagesService.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.productImagesService.delete(id);
  }

  //  get all images of a product
  @Get()
  GetAll(@Param('id') id: string) {
    return this.productImagesService.GetAll(id);
  }
}
