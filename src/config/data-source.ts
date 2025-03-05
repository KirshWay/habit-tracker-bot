import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isProduction ? 'postgres' : 'localhost',
  port: 5432,
  username: 'postgres',
  password: process.env.DB_PASS,
  database: 'postgres',
  synchronize: false,
  logging: false,
  entities: [isProduction ? 'dist/entities/*.js' : 'src/entities/*.ts'],
  migrations: [isProduction ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.error("Error during Data Source initialization:", error))
