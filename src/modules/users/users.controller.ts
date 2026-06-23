import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { usersService } from './users.service';

export const usersController = {
  async me(req: Request, res: Response) {
    const data = await usersService.getMe(req.authUser!.id);
    res.json(successResponse('Profile fetched', data));
  },

  async updateMe(req: Request, res: Response) {
    const data = await usersService.updateMe(req.authUser!.id, req.body);
    res.json(successResponse('Profile updated', data));
  },

  async loanHistory(req: Request, res: Response) {
    const data = await usersService.getLoanHistory(req.authUser!.id);
    res.json(successResponse('Loan history fetched', data));
  },
};
