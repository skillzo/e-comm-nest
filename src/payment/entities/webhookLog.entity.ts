import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('webhook_logs')
export class WebhookLogEntity {
  @PrimaryGeneratedColumn('uuid')
  webhook_log_id: string;

  @Column()
  provider: string; // 'paystack'

  @Column('jsonb')
  payload: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  received_at: Date;
}
