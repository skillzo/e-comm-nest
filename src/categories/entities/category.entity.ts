import { ProductEntity } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column()
  name: string;

  @ManyToOne(() => CategoryEntity, (c) => c.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: CategoryEntity;

  @OneToMany(() => CategoryEntity, (c) => c.parent)
  children: CategoryEntity[];

  @OneToMany(() => ProductEntity, (p) => p.category)
  products: ProductEntity[];

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
