import * as dotenv from 'dotenv';

dotenv.config();

const allowedNodeEnvs = new Set(['development', 'production', 'test'] as const);

const rawNodeEnv = process.env.NODE_ENV?.trim();

if (rawNodeEnv && !allowedNodeEnvs.has(rawNodeEnv as 'development' | 'production' | 'test')) {
  throw new Error(`Invalid NODE_ENV value: "${rawNodeEnv}"`);
}

export const nodeEnv = (rawNodeEnv || 'development') as 'development' | 'production' | 'test';
export const isProduction = nodeEnv === 'production';

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
