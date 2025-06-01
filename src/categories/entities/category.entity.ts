import { ProductEntity } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column()
  name: string;

  @ManyToOne(() => CategoryEntity, (c) => c.children, { nullable: true })
  parent: CategoryEntity;

  @OneToMany(() => CategoryEntity, (c) => c.parent)
  children: CategoryEntity[];

  @OneToMany(() => ProductEntity, (p) => p.category)
  products: ProductEntity[];
}
