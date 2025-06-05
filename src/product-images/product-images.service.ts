import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { Repository } from 'typeorm';
import { ProductImageEntity } from './entities/product-image.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImageEntity)
    private readonly productImagesRepository: Repository<ProductImageEntity>,

    private readonly productsService: ProductsService,
  ) {}

  async GetAll(id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) throw new NotFoundException('Product not found');
    return await this.productImagesRepository.find({
      where: { product: product },
    });
  }

  async create(dto: CreateProductImageDto) {
    const product = await this.productsService.findOne(dto.product_id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const images = dto.image_url.map((url, idx) => {
      return this.productImagesRepository.create({
        image_url: url,
        product,
        is_primary: false,
        sort_order: dto.sort_order ?? idx,
      });
    });

    await this.productImagesRepository.save(images);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Images added successfully',
    };
  }

  async update(id: string, dto: UpdateProductImageDto) {
    if (!dto.product_id)
      throw new BadRequestException('Product id is required');
    const product = await this.productsService.findOne(dto.product_id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productImagesRepository.update(id, {
      product,
      image_url: dto.image_url,
      is_primary: dto.is_primary,
      sort_order: dto.sort_order,
    });

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Image updated successfully',
    };
  }

  async delete(id: string) {
    const image = await this.productImagesRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.productImagesRepository.remove(image);

    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
    };
  }
}
