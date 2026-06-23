import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectRedis } from './config/redis';
import { connectDatabase, disconnectDatabase } from './database/prisma';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Loan backend listening');
  });
}

void bootstrap().catch(async (error) => {
  logger.error({ error }, 'Startup failure');
  await disconnectDatabase();
  process.exit(1);
});
