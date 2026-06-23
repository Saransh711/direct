import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { prisma } from '../../database/prisma';

export const auditController = {
  async list(_req: Request, res: Response) {
    const data = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json(successResponse('Audit logs fetched', data));
  },
};
