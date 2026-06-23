import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../database/prisma';

export function auditTrail(module: string, actionType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        return;
      }
      void prisma.auditLog.create({
        data: {
          userId: req.authUser?.id,
          module,
          actionType,
          metadata: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    });
    next();
  };
}
