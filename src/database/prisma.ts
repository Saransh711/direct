import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('PostgreSQL connection established');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
