import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { eligibilityService } from './eligibility.service';

export const eligibilityController = {
  async check(req: Request, res: Response) {
    const data = await eligibilityService.check(req.authUser!.id, req.body.loanApplicationId);
    res.json(successResponse('Eligibility evaluated', data));
  },
};
