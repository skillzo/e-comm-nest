import { AddressEntity } from 'src/address/entities/address.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { Roles, UserStatus } from 'src/utility/enums/user.enum';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.USER] })
  role: Roles[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => OrderEntity, (o) => o.order_id)
  orders: OrderEntity[];

  @OneToMany(() => AddressEntity, (a) => a.address_id)
  addresses: AddressEntity[];
}

// {
//   id: string;
//   name: string;
//   email: string;
//   password: string;
//   role: Roles[];
//   created_at: Date;
//   updated_at: Date;
//   is_active: boolean;
//   orders: OrderEntity[]
//   address: AddressEntity[]
// }
