import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { buildPaginatedResponse } from 'src/common/pagination.response';
import { IAPIResponse } from 'interfaces/api-response.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async create(dto: CreateCategoryDto) {
    let parent: CategoryEntity | null | undefined = undefined;

    if (dto.parent_id) {
      parent = await this.categoriesRepository.findOneBy({
        category_id: dto.parent_id,
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const category = this.categoriesRepository.create({
      name: dto.name,
      parent,
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(
    page = 1,
    limit = 10,
    query?: string,
  ): Promise<IAPIResponse<CategoryEntity[]>> {
    const where: FindOptionsWhere<CategoryEntity> = {
      deleted_at: IsNull(),
      parent: IsNull(),
    };

    if (query) {
      where.name = ILike(`%${query}%`);
    }
    const [data, totalCount] = await this.categoriesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where,
      relations: ['children'],
      select: {
        name: true,
        category_id: true,
        parent: {
          category_id: true,
          name: true,
        },
        children: {
          category_id: true,
          name: true,
        },
      },
    });

    return buildPaginatedResponse(
      data,
      totalCount,
      page,
      limit,
      'Categories fetched successfully',
    );
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOne({
      where: { category_id: id, deleted_at: IsNull() },
      select: ['category_id', 'name'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.categoriesRepository.update(id, { name: dto.name });
    return this.findOne(id);
    return;
  }
}

// {
//     "name": "Sneakers",
//     "children": [
//       { "name": "Running Sneakers" },
//       { "name": "Training Sneakers" },
//     ],
//   }
