import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from 'src/jobs/processors/mail.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    BullModule.forRoot({
      connection: { host: 'localhost', port: 6379 },
      defaultJobOptions: {
        removeOnComplete: 50,
        attempts: 3,
      },
    }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [UsersController],
  providers: [UsersService, MailProcessor],
  exports: [UsersService],
})
export class UsersModule {}
