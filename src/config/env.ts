import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_POINTS: z.coerce.number().min(1).default(100),
  RATE_LIMIT_DURATION: z.coerce.number().min(1).default(60),
  BUREAU_MAX_RETRIES: z.coerce.number().min(1).default(3),
  BUREAU_TIMEOUT_MS: z.coerce.number().min(100).default(2000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((value) => value.trim()),
};
