import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  // subscribers: ['src/subscriber/**/*.ts'],
};

export const dataSource = new DataSource(dataSourceOptions);
