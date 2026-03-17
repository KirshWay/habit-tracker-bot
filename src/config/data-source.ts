import { DataSource } from 'typeorm';
import path from 'path';
import { isProduction, requireEnv } from './env';

const root = path.resolve(__dirname, '../..');
const entitiesPath = path.join(root, isProduction ? 'dist/entities/*.js' : 'src/entities/*.ts');
const migrationsPath = path.join(root, isProduction ? 'dist/migrations/*.js' : 'src/migrations/*.ts');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || (isProduction ? 'postgres' : 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: 'postgres',
  password: requireEnv('DB_PASS'),
  database: 'postgres',
  synchronize: false,
  logging: false,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  subscribers: [],
});
