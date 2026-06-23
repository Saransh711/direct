import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    (req as Request & { validatedQuery?: unknown }).validatedQuery = schema.parse(req.query);
    next();
  };
}
