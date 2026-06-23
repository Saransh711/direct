import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../common/roles';
import { AppError } from '../common/errors';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  req.authUser = { id: payload.sub, role: payload.role as Role };
  next();
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      throw new AppError('Unauthorized', 401);
    }
    if (!roles.includes(req.authUser.role)) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
}
