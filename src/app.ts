import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { successResponse } from './common/api-response';
import { env } from './config/env';
import { logger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { prisma } from './database/prisma';
import { authenticate } from './middleware/auth.middleware';
import { correlationIdMiddleware } from './middleware/correlation-id.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { register, metricsMiddleware } from './middleware/metrics.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  app.use(correlationIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ correlationId: (req as express.Request).correlationId }),
    }),
  );

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  // app.use(rateLimitMiddleware());
  app.use(metricsMiddleware);

  app.get('/health', (_req, res) => {
    res.json(successResponse('Service healthy', { status: 'ok' }));
  });

  app.get('/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json(successResponse('Service ready', { status: 'ready' }));
    } catch {
      res.status(503).json({
        success: false,
        message: 'Service not ready',
        errors: [{ message: 'Database not available' }],
        traceId: 'system',
      });
    }
  });

  app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  });
  setupSwagger(app);
  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
