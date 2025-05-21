import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { dataSourceOptions } from 'db/dataSource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
