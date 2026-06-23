import type { NextFunction, Request, Response } from 'express';
import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    const route = req.route?.path ?? req.path;
    httpCounter.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });
  });
  next();
}
