import { AddressEntity } from 'src/address/entities/address.entity';
import { OrderItemEntity } from 'src/order-items/entities/order-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/utility/enums/order.enums';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @ManyToOne(() => UserEntity, (u) => u.orders)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => OrderItemEntity, (i) => i.order, {
    cascade: ['insert', 'update'],
  })
  items: OrderItemEntity[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => AddressEntity, (a) => a.address_id, { nullable: false })
  @JoinColumn({ name: 'shipping_address_id' })
  shipping_address: AddressEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
