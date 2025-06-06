import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdatePriceDto,
  UpdateProductDto,
  UpdateStockDto,
} from './dto/update-product.dto';
import { AuthRoles } from 'src/utility/decorators/roles.decorator';
import { Roles } from 'src/utility/enums/user.enum';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
// @AuthRoles(Roles.ADMIN)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  create(@Body() createProductDto: CreateProductDto) {
    console.log('createProductDto', createProductDto);
    return this.productsService.create(createProductDto);
  }

  @Get('getAll')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('getById/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('findByCategory/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Patch('toggleActivation/:id')
  toggleActivation(@Param('id') id: string) {
    return this.productsService.toggleActivation(id);
  }

  @Patch('updatePrice/:id')
  updatePrice(@Param('id') id: string, @Body() price: UpdatePriceDto) {
    return this.productsService.updatePrice(id, Number(price.price));
  }

  @Patch('updateStock/:id')
  updateStock(@Param('id') id: string, @Body() quantity: UpdateStockDto) {
    return this.productsService.updateStock(
      id,
      Number(quantity.stock_quantity),
    );
  }
}
