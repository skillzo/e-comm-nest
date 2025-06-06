import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IAPIResponse } from 'interfaces/api-response.interface';
import { ProductEntity } from './entities/product.entity';
import { Between, FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { buildPaginatedResponse } from 'src/common/pagination.response';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    private readonly categoryService: CategoriesService,
  ) {}

  //  public

  // GET /products — Get all active products (with pagination, filtering, sorting)
  async findAll(
    page = 1,
    pageSize = 10,
    query?: string,
    sortBy = 'DESC',
    filter?: {
      startDate?: string;
      endDate?: string;
    },
  ): Promise<IAPIResponse<ProductEntity[]>> {
    const where: FindOptionsWhere<ProductEntity> = {
      is_active: true,
      deleted_at: IsNull(),
    };

    if (query) {
      where.name = ILike(`%${query}%`);
    }

    if (filter?.startDate && filter?.endDate) {
      where.created_at = Between(
        new Date(filter.startDate),
        new Date(filter?.endDate),
      );
    }

    const [data, totalCount] = await this.productRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      order: {
        created_at: sortBy === 'DESC' ? 'DESC' : 'ASC',
      },
      relations: ['category'],
      select: {
        name: true,
        product_id: true,
        created_at: true,
        image_url: true,
        category: {
          category_id: true,
          name: true,
        },
        is_active: true,
      },
    });

    return buildPaginatedResponse(
      data,
      totalCount,
      page,
      pageSize,
      'Products fetched successfully',
    );
  }

  // GET /products/:id — Get single product details
  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { product_id: id, deleted_at: IsNull() },
      relations: ['category', 'images'],
      select: {
        name: true,
        product_id: true,

        description: true,
        price: true,
        stock_quantity: true,
        is_active: true,
        image_url: true,
        images: {
          id: true,
          image_url: true,
        },
        category: {
          category_id: true,
          name: true,
        },
        updated_at: true,
        created_at: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // GET /products/category/:categoryId — Get products by category
  async findByCategory(categoryId: string): Promise<ProductEntity[]> {
    const products = await this.productRepository.find({
      where: {
        category: { category_id: categoryId },
        deleted_at: IsNull(),
        is_active: true,
      },
      relations: ['category'],
      select: {
        name: true,
        product_id: true,
        description: true,
        image_url: true,
        price: true,
        is_active: true,
        category: {
          category_id: true,
          name: true,
        },
      },
    });

    return products;
  }

  // admin endpoints

  // POST /products — Create a new product
  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const category = await this.categoryService.findOne(dto.category_id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({ ...dto, category });
    return await this.productRepository.save(product);
  }

  // PATCH /products/:id — Update product details
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const category = await this.categoryService.findOne(dto.category_id!);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedProduct = {
      ...product,
      category,
      name: dto.name,
      image_url: dto.image_url,
      description: dto.description,
    };

    return await this.productRepository.save(updatedProduct);
  }
  // DELETE /products/:id — Soft delete product
  async delete(id: string) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return await this.productRepository.softRemove(product);
  }

  // PATCH /products/:id/activate — Activate or deactivate a product
  async toggleActivation(id: string) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.update(id, {
      is_active: !product.is_active,
    });

    return {
      data: await this.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
    };
  }

  // PATCH /products/:id/stock — Update stock quantity
  async updateStock(id: string, quantity: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.update(id, {
      stock_quantity: quantity,
    });

    return {
      data: await this.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
    };
  }

  // PATCH /products/:id/price — Update product price
  async updatePrice(id: string, price: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.update(id, {
      price: Number(price),
    });

    return {
      data: await this.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
    };
  }

  // GET /admin/products — Get all products (including inactive/deleted)
  async getAll() {
    return await this.productRepository.find({
      relations: ['category'],
      select: {
        name: true,
        product_id: true,
        category: {
          category_id: true,
          name: true,
        },
      },
    });
  }
}

// public
// GET /products/featured — Get featured products (if applicable)

// admin

// BATCH A

// [
//  {
//     "name": "Nike Air Max 270",
//     "description": "Lightweight, breathable, and stylish sneakers perfect for gym and street wear.",
//     "price": 95000,
//     "stock_quantity": 120,
//     "is_active": true,
//     "image_url": "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/10747498-d6bb-403b-8698-635e2dd652c5/NIKE+AIR+MAX+270+%28GS%29.png",
//     "category_id": "8476eb26-c681-4164-9baf-a8039b955ba4",
//     "images": [
//        "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/10747498-d6bb-403b-8698-635e2dd652c5/NIKE+AIR+MAX+270+%28GS%29.png",
//        "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/fe55b36b-e2b1-4cc9-a6af-f599041fc7b7/NIKE+AIR+MAX+270+%28GS%29.png",
//        "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/2c762834-b67a-4745-b5ec-ece3dd623fb1/NIKE+AIR+MAX+270+%28GS%29.png",
//        "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/19e191e6-b01e-4397-aaf5-876e61b91c64/AIR+MAX+270+BG.png",
//        "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/16998d4d-43b4-420b-ace4-a94d1c0c6fe4/AIR+MAX+270+BG.png",
//        "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/acff1897-ec3e-447c-8dc1-98ba7ca51889/AIR+MAX+270+OD+%28GS%29.png"

//     ]
//  },
//     {
//     "name": "Adidas Ultraboost 22",
//     "description": "High-performance running shoes designed for comfort and endurance.",
//     "price": 105000,
//     "stock_quantity": 80,
//     "image_url": "https://assets.adidas.com/images/w_600,f_auto,q_auto/4ff790231b7f461baee3c291e96b74af_9366/Ultraboost_1.0_Shoes_Black_HQ4199_HM1.jpg",
//     "category_id": "19ba60db-6362-4148-90e9-73202dadc1c1",
//     "images": [
//       "https://assets.adidas.com/images/w_600,f_auto,q_auto/4ff790231b7f461baee3c291e96b74af_9366/Ultraboost_1.0_Shoes_Black_HQ4199_HM1.jpg",
//       "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/248b016bfd024281899e335acfd561c1_9366/Ultraboost_1.0_Shoes_Black_HQ4199_HM3_hover.jpg",
//       "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d2477e1ac67b4362b2a10015d9bf1936_9366/Ultraboost_1.0_Shoes_Black_HQ4199_HM4.jpg"]
//  },
//   {
//   "name": "Gym Shark Sweat Hoodie",
//   "description": "",
//   "price": 45000,
//   "stock_quantity": 60,
//   "is_active": true,
//   "image_url": "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1335_1080x.jpg?v=1729075597",
//   "category_id": "0369dd96-1a4a-4313-abcd-eff8a3a4379f",
//   "images": [
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1335_1080x.jpg?v=1729075597",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1319_1080x.jpg?v=1729075597",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1323_1080x.jpg?v=1729075597",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1354_1080x.jpg?v=1729075597",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1338_1080x.jpg?v=1729075597",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1340_1080x.jpg?v=1729075598",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1343_1080x.jpg?v=1729075597",
//     "https://cdn.shopify.com/s/files/1/1367/5207/files/GYMSHARKPOWERSOLIDHOODIEGSBlackB2B4A-BB2J-1345_1080x.jpg?v=1729075597"
//     ]
// }
// {
//       "name": "Sweat Seamless Leggings",
//       "description": "<p>Your sweat speaks for itself, so now it&rsquo;s time to embrace it. Sleek, soft and comfortable fabrics meet powerful and resilient designs in the new SWEAT collection. DYNMC&trade;️ fabric (powered by Sensil Nylon 66) heightens breathability whilst still providing maximum durability, so you can stay cool during the sweatiest sessions, and rely on SWEAT to endure your workouts time and time again. In the collection that you&rsquo;ll feel hyped to wear for your next workout, all that&rsquo;s left to do is sweat.</p> <p><br />- High-waisted<br />- We&rsquo;ve removed the pique sculpt contour based on your feedback<br />- Full length legging<br />- Premium DYNMC&trade;️ fabric is soft, breathable and durable<br />- Ribbed, shaped waistband to ensure maximum comfort, support and coverage<br />- Eyelet detailing to back of thigh, knee and calf<br />- 4-way-stretch design for freedom of movement<br />- Sharkhead heat seal logo to hip<br />- 83% Nylon, 9% Elastane, 8% Polyester<br />- Model 1 is&nbsp;5&rsquo;8&rdquo; and wears a size XS<br />- Model 2 is&nbsp;5&rsquo;10&rdquo; and wears a size L<br />- SKU: B6A4T-BBBB</p>",
//       "price": 59280,
//       "stock_quantity": 60,
//       "is_active": true,
//       "image_url": "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0902.79_84e1cdeb-e26f-4915-93b6-40ed37a35189_1080x.jpg?v=1702639260",
//       "category_id": "16d8b683-acb0-4c05-a8d0-b52f2a429f01",
// "images":  [
//       "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0902.79_84e1cdeb-e26f-4915-93b6-40ed37a35189_1080x.jpg?v=1702639260",

//       "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0924.82_de6a79b7-4fdc-4c2a-87ba-03b52fbba9af_1080x.jpg?v=1702639262",

//       "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0918.81_f5d1a5fc-61d8-4a0a-b371-409d7c33bf19_1080x.jpg?v=1702639261",
//       "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0931.84_0d455a78-0cce-4d65-a2e0-8f2e26245967_1080x.jpg?v=1702639261",
//       "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0911.80_c3a07862-4e18-424a-8916-e7ec1fd1319c_1080x.jpg?v=1702639262",
//       "https://cdn.shopify.com/s/files/1/1367/5207/files/SweatSeamlessLeggingsBlack-B6A4T-BBBB-0927.83_176d31d9-f8c5-4630-ad3d-e27181503d61_1080x.jpg?v=1702639261",
//       "https://cdn.shopify.com/s/files/1/1367/5207/files/Sweatleggings2.0BlackBlackB6A4T-BBBB-0222_1080x.jpg?v=1702639260",
//       "https://cdn.shopify.com/s/files/1/1367/5207/files/Sweatleggings2.0BlackBlackB6A4T-BBBB-0214_1080x.jpg?v=1702639262"
//       ]
//     }

////////////////////////////

// Batch B
//    {
//       "name": "Nike Dri-FIT Training Shirt",
//       "description": "Moisture-wicking training shirt for high-performance activities.",
//       "price": 30000,
//       "stock_quantity": 150,
//       "is_active": true,
//       "images": "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/6236b04a-b3af-4466-b86c-0fc05cdf1045/M+ACG+DF+TEE+OC+GUIDE.png",
//       "category_id": "8b3df23c-0177-4a1b-8d6b-f61b486cba58"
// "images":  [
//      "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/6236b04a-b3af-4466-b86c-0fc05cdf1045/M+ACG+DF+TEE+OC+GUIDE.png",
// "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/00057f93-57be-488c-9c3c-57ef011cb4b2/M+ACG+DF+TEE+OC+GUIDE.png",
// "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/c8f56b71-9f5a-4341-b9ec-009485f7b68d/M+ACG+DF+TEE+OC+GUIDE.png",
// "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/74c7d23e-f5ee-4b14-a961-67504f6df7f1/M+ACG+DF+TEE+OC+GUIDE.png",
// "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/f761b805-a8eb-49f1-9d46-fd69e0498ae3/M+ACG+DF+TEE+OC+GUIDE.png",

//       ]
//    },
//    {
//       "name": "Under Armour Training Joggers",
//       "description": "Comfortable, flexible joggers perfect for workouts or casual days.",
//       "price": 55000,
//       "stock_quantity": 100,
//       "is_active": true,
//       "images": "https://underarmour.scene7.com/is/image/Underarmour/V5-6000663-001_WSTBND?rp=standard-0pad%7CpdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on%2Con&bgc=F0F0F0&wid=566&hei=708&size=566%2C708",
//       "category_id": "8b3df23c-0177-4a1b-8d6b-f61b486cba58",
// "images":  [
//      "https://underarmour.scene7.com/is/image/Underarmour/V5-6000663-001_WSTBND?rp=standard-0pad%7CpdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on%2Con&bgc=F0F0F0&wid=566&hei=708&size=566%2C708",
// "https://underarmour.scene7.com/is/image/Underarmour/V5-6000663-001_FSF?rp=standard-0pad%7CpdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on%2Con&bgc=F0F0F0&wid=566&hei=708&size=566%2C708",
// "https://underarmour.scene7.com/is/image/Underarmour/V5-6000663-001_FC?rp=standard-0pad%7CpdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on%2Con&bgc=F0F0F0&wid=566&hei=708&size=566%2C708",
// "https://underarmour.scene7.com/is/image/Underarmour/V5-6000663-001_BC?rp=standard-0pad%7CpdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on%2Con&bgc=F0F0F0&wid=566&hei=708&size=566%2C708"

//       ]
//    }
// ]

// [
//   {
//     "name": "Adidas Ultraboost 21",
//     "description": "<h3 class="subtitle___9ljbp">Experience ultimate energy return with Ultraboost 21.</h3> <p class="gl-vspace">Prototype after prototype. Innovation after innovation. Testing after testing. Meet us in the hot pursuit of the pinnacle harmonization of weight, cushioning, and responsiveness. Ultraboost 21. Say hello to incredible energy return.</p>",
//     "price": 105000,
//     "stock_quantity": 80,
//     "is_active": true,
//     "image_url": "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/c1eb190cf35440038645ad4f0105e2e7_9366/Ultraboost_21_Running_Shoes_Black_GX5236_01_standard.jpg",
//     "category_id": "<sneakers-category-uuid>",
//    // "images":  [
//      "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/c1eb190cf35440038645ad4f0105e2e7_9366/Ultraboost_21_Running_Shoes_Black_GX5236_01_standard.jpg",
// "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/ef879513892b4ce6b97ead4f0105f310_9366/Ultraboost_21_Running_Shoes_Black_GX5236_02_standard_hover.jpg",
// "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/95472cae230842cfaa85ad4f0105fa37_9366/Ultraboost_21_Running_Shoes_Black_GX5236_03_standard.jpg",
// "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/fe3a7e36906342479b39ad4f0106025c_9366/Ultraboost_21_Running_Shoes_Black_GX5236_04_standard.jpg",
// "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/afbcd71bd3444ebeae42ad4f01060ae9_9366/Ultraboost_21_Running_Shoes_Black_GX5236_05_standard.jpg",
// "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/069e5beb2106426a9ff3ad4f0105ea3f_9366/Ultraboost_21_Running_Shoes_Black_GX5236_06_standard.jpg",
// "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/b56e18ededf04945af24ad4f010618fe_9366/Ultraboost_21_Running_Shoes_Black_GX5236_42_detail.jpg",
// "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/631583bc38e04df8bd60adcd01188d80_9366/Ultraboost_21_Running_Shoes_Black_GX5236_HM2.jpg"
//       ]
//   },
//   {
//     "name": "Nike Dri-FIT Sweatshirt",
//     "description": "Moisture-wicking sweatshirt designed for optimal gym performance.",
//     "price": 45000,
//     "stock_quantity": 150,
//     "is_active": true,
//     "image_url": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/ff54f31d-3dd9-418a-95bf-4c08e7642f24/M+NK+DF+24.7+IS+HZ.png",
//     "category_id": "<sweatshirts-category-uuid>",
//    // "images":  [
//      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a670f40d-0557-481a-b86c-da5da1fac16b/M+NK+DF+24.7+IS+HZ.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/346c30ec-62d7-4b06-873d-328d21e96a2b/M+NK+DF+24.7+IS+HZ.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a83c1927-2243-48d6-8b7b-9c55981a7693/M+NK+DF+24.7+IS+HZ.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5c31f4f6-b2cb-4077-96f8-f1cea7ec22c1/M+NK+DF+24.7+IS+HZ.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/eb1a1e58-edc8-4846-a1fe-654eaaf6a5fd/M+NK+DF+24.7+IS+HZ.png"
//       ]
//   },
//   {
//     "name": "Deviate NITRO™ 3",
//     "description": "<div class="undefined tw-xwzea6 tw-1n7poqb tw-1h4nwdw" data-uds-child="text">Experience unparalleled propulsion in your everyday training runs with the Deviate NITRO&trade; 3, featuring PWRPLATE technology and NITROFOAM&trade;. This highly responsive trainer delivers a snappy ride, infusing speed into every stride.</div><ul class="undefined tw-xwzea6 tw-1n7poqb tw-1h4nwdw list-disc list-inside" data-uds-child="text"> <li>Style:&nbsp;309707_01</li> <li>Color:&nbsp;PUMA Black-PUMA White</li> </ul>",
//     "price": 75000,
//     "stock_quantity": 90,
//     "is_active": true,
//     "image_url": "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_1050,h_1050/global/309707/01/sv01/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes",
//     "category_id": "<sneakers-category-uuid>",
//    // "images":  [
//      "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_1050,h_1050/global/309707/01/sv01/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes",
// "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/309707/01/mod01/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes",
// "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/309707/01/mod02/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes",
// "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/309707/01/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes",
// "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/309707/01/bv/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes",
// "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/309707/01/sv04/fnd/PNA/fmt/png/Deviate-NITRO%E2%84%A2-3-Men's-Road-Running-Shoes"

//       ]
//   },
//   {
//     "name": "Reebok Speedwick Joggers",
//     "description": "Sweat-wicking joggers ideal for workouts and casual wear.",
//     "price": 35000,
//     "stock_quantity": 200,
//     "is_active": true,
//     "image_url": "https://assets.ajio.com/medias/sys_master/root/20211221/IdBo/61c0da5ff997ddf8f1580bf1/-473Wx593H-460755643-black-MODEL2.jpg",
//     "category_id": "<gymwear-category-uuid>",
//    // "images":  [
//      "https://assets.ajio.com/medias/sys_master/root/20211221/IdBo/61c0da5ff997ddf8f1580bf1/-473Wx593H-460755643-black-MODEL2.jpg",
// "https://assets.ajio.com/medias/sys_master/root/20211221/sAmf/61c0d519f997ddf8f157f306/-473Wx593H-460755643-black-MODEL4.jpg",
// "https://assets.ajio.com/medias/sys_master/root/20211221/CUsV/61c0d32af997ddf8f157e901/-473Wx593H-460755643-black-MODEL3.jpg",
// "https://assets.ajio.com/medias/sys_master/root/20211221/qWDb/61c0de82aeb269011013ab9d/-473Wx593H-460755643-black-MODEL.jpg"
//       ]
//   },

// BATCH C
//   {
//     "name": "Under Armour Charged Assert 8",
//     "description": "Durable running shoes with excellent cushioning and support.",
//     "price": 67000,
//     "stock_quantity": 130,
//     "is_active": true,
//     "image_url": "https://underarmour.scene7.com/is/image/Underarmour/3021972-001_DEFAULT?rp=standard-30pad|pdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on,on&bgc=f0f0f0&wid=566&hei=708&size=536,688",
//     "category_id": "<sneakers-category-uuid>",
//     // "images":  [
//      "https://underarmour.scene7.com/is/image/Underarmour/3021972-001_DEFAULT?rp=standard-30pad|pdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on,on&bgc=f0f0f0&wid=566&hei=708&size=536,688",
// "https://underarmour.scene7.com/is/image/Underarmour/3021972-001_A?rp=standard-30pad|pdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on,on&bgc=f0f0f0&wid=566&hei=708&size=536,688",
// "https://underarmour.scene7.com/is/image/Underarmour/3021972-001_TOE?rp=standard-30pad|pdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on,on&bgc=f0f0f0&wid=566&hei=708&size=536,688",
// "https://underarmour.scene7.com/is/image/Underarmour/3021972-001_PAIR?rp=standard-30pad|pdpMainDesktop&scl=1&fmt=jpg&qlt=85&resMode=sharp2&cache=on,on&bgc=f0f0f0&wid=566&hei=708&size=536,688",

//       ]
//   },
//   {
//     "name": "Nike Tech Fleece Hoodie",
//     "description": "Warm and lightweight hoodie, perfect for outdoor training.",
//     "price": 55000,
//     "stock_quantity": 110,
//     "is_active": true,
//     "image_url": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8411de2b-0e0e-46c6-b889-5531bb6f3aac/G+NSW+TCH+FLC+HD+FZ+LS+-+PD.png",
//     "category_id": "<sweatshirts-category-uuid>",
//    // "images":  [
//      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8411de2b-0e0e-46c6-b889-5531bb6f3aac/G+NSW+TCH+FLC+HD+FZ+LS+-+PD.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/229ecfe0-edbd-44b5-b756-56f9fb4fe88e/G+NSW+TCH+FLC+HD+FZ+LS+-+PD.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a7239d43-26de-4832-a8bc-164189bf6af9/G+NSW+TCH+FLC+HD+FZ+LS+-+PD.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/74222304-2a01-45e0-b65e-7f509944233f/G+NSW+TCH+FLC+HD+FZ+LS+-+PD.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/be59c1f5-baa2-4e78-bb4a-f5c175271fde/G+NSW+TCH+FLC+HD+FZ+LS+-+PD.png"
//       ]
//   },
//   {
//     "name": "Adidas Essentials 3-Stripes T-Shirt",
//     "description": "Classic gym t-shirt with iconic 3-Stripes design.",
//     "price": 20000,
//     "stock_quantity": 250,
//     "is_active": true,
//     "image_url": "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d6667cb6ee104a0aa02dac6301023956_9366/Essentials_3-Stripes_Tee_Grey_GL3735_01_laydown.jpg",
//     "category_id": "<gymwear-category-uuid>",
//     // "images":  [
//      "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d6667cb6ee104a0aa02dac6301023956_9366/Essentials_3-Stripes_Tee_Grey_GL3735_01_laydown.jpg",
// ('https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/bbe83716c9b445788164add700bb7c54_9366/Essentials_3-Stripes_Tee_Blue_HE4410_01_laydown.jpg');
//       ]
//   },
//   {
//     "name": "Nike React Infinity Run Flyknit",
//     "description": "High-performance running shoes designed to reduce injury.",
//     "price": 120000,
//     "stock_quantity": 70,
//     "is_active": true,
//     "image_url": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f21ce99a-a0f1-410f-a2ff-c93b27f457b2/NIKE+REACT+PHANTOM+RUN+FK+2.png",
//     "category_id": "<sneakers-category-uuid>",
//    // "images":  [
//      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f21ce99a-a0f1-410f-a2ff-c93b27f457b2/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/81f82c6f-dc88-4a11-bcf4-81cdda9812e8/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/93357eee-4669-4f88-b3b6-c9299eef27c0/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b0ea8448-0434-4d3b-a30a-d5b58d186383/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/1eeaeea6-1449-4760-a05a-2b72aabcd7da/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/7d0f4cf0-2fbc-47cc-bbf1-73895ea21dac/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/d66286f9-7a4c-4b41-8dab-67984392171d/NIKE+REACT+PHANTOM+RUN+FK+2.png",
// "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/6b487b4e-255d-4a29-917c-0c32d406ebbc/NIKE+REACT+PHANTOM+RUN+FK+2.png"
//       ]
//   },
// ]
