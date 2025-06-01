import { CategoryEntity } from 'src/categories/entities/category.entity';
import { ProductImageEntity } from 'src/product-images/entities/product-image.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  stock_quantity: number;

  @Column({ default: true })
  is_active: string;

  @Column()
  image_url: string;

  @ManyToOne(() => CategoryEntity, (c) => c.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => ProductImageEntity, (i) => i.product)
  images: ProductImageEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
