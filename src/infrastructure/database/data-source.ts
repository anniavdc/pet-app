import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: getEnvOrThrow('DATABASE_HOST'),
  port: parseInt(getEnvOrThrow('DATABASE_PORT'), 10),
  username: getEnvOrThrow('DATABASE_USER'),
  password: getEnvOrThrow('DATABASE_PASSWORD'),
  database: getEnvOrThrow('DATABASE_NAME'),
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.NODE_ENV !== 'production' && process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [],
});
