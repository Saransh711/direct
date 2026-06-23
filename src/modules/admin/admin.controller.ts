import type { Request, Response } from 'express';
import { z } from 'zod';
import { successResponse } from '../../common/api-response';
import { adminService } from './admin.service';
import { disbursementService } from '../disbursement/disbursement.service';

const decisionSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const adminController = {
  async listApplications(_req: Request, res: Response) {
    const data = await adminService.listApplications();
    res.json(successResponse('Applications fetched', data));
  },

  async getApplication(req: Request, res: Response) {
    const data = await adminService.getApplication(String(req.params.id));
    res.json(successResponse('Application fetched', data));
  },

  async approve(req: Request, res: Response) {
    const payload = decisionSchema.parse(req.body);
    const data = await adminService.approve(
      String(req.params.id),
      req.authUser!.id,
      payload.reason,
    );
    res.json(successResponse('Application approved', data));
  },

  async reject(req: Request, res: Response) {
    const payload = decisionSchema.parse(req.body);
    const data = await adminService.reject(String(req.params.id), req.authUser!.id, payload.reason);
    res.json(successResponse('Application rejected', data));
  },

  async disburse(req: Request, res: Response) {
    const data = await disbursementService.disburse(String(req.params.id), req.authUser!.id);
    res.status(201).json(successResponse('Disbursement completed', data));
  },
};
