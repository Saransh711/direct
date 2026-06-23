import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { disbursementService } from './disbursement.service';

export const disbursementController = {
  async disburse(req: Request, res: Response) {
    const data = await disbursementService.disburse(String(req.params.id), req.authUser!.id);
    res.status(201).json(successResponse('Loan disbursed', data));
  },
};
