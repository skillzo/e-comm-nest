import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  x; //  public
  // GET /products — Get all active products (with pagination, filtering, sorting)
  // GET /products/:id — Get single product details
  // GET /products/category/:categoryId — Get products by category
  // GET /products/search?q=keyword — Search products by name/description
  // GET /products/featured — Get featured products (if applicable)
  // GET /products/recent

  // admin
  // POST /products — Create a new product
  // PATCH /products/:id — Update product details
  // DELETE /products/:id — Soft delete product
  // PATCH /products/:id/activate — Activate or deactivate a product
  // POST /products/:id/images — Upload additional product images
  // DELETE /products/:productId/images/:imageId — Delete specific image from a product
  // PATCH /products/:id/stock — Update stock quantity
  // PATCH /products/:id/price — Update product price
  // GET /admin/products — Get all products (including inactive/deleted)
}
