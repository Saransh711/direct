import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { prisma } from '../../database/prisma';
import { creditBureauService } from './credit-bureau.service';
import { creditCheckSchema } from './credit-bureau.schemas';

export const creditBureauController = {
  async check(req: Request, res: Response) {
    const validated = creditCheckSchema.parse(req.body);
    const result = await creditBureauService.checkCredit(validated, req.correlationId);
    res.json(successResponse('Credit report generated successfully', result));
  },

  async score(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.authUser!.id } });
    const seed = `${user?.email ?? req.authUser!.id}-${user?.phoneNumber ?? ''}`;
    const report = await creditBureauService.getLatestOrFetch(req.authUser!.id, seed);
    res.json(successResponse('Credit score fetched', report));
  },
};
