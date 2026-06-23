import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-correlation-id'];
  const correlationId =
    typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
