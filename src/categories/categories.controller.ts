import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    const cat = this.categoriesService.create(createCategoryDto);
    return cat;
  }

  @Get('getAll')
  @HttpCode(200)
  findAll(
    @Query('page') page: number = 1,
    @Query('page') pageSize: number = 10,
    @Query('query') query: string,
  ) {
    return this.categoriesService.findAll(
      Number(page),
      Number(pageSize),
      query,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }
}
