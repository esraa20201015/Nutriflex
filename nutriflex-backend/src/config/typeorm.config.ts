require('dotenv').config({ path: `${process.cwd()}/.env` });
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA, 
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  logging: true, 
  synchronize: process.env.NODE_ENV !== 'production',
  extra: {
    max: Number(process.env.POOL_SIZE) || 10,
  },
  ssl: {
    rejectUnauthorized: false, 
  },

  
};
 