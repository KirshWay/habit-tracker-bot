import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import path from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const root = path.resolve(__dirname, '../..');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isProduction ? 'postgres' : 'localhost',
  port: 5432,
  username: 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: 'postgres',
  synchronize: false,
  logging: false,
  entities: [path.join(root, isProduction ? 'dist' : 'src', 'entities/*.js')],
  migrations: [path.join(root, isProduction ? 'dist' : 'src', 'migrations/*.js')],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.error("Error during Data Source initialization:", error))
