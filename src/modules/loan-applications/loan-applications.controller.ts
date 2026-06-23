import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { loanApplicationsService } from './loan-applications.service';

export const loanApplicationsController = {
  async create(req: Request, res: Response) {
    const data = await loanApplicationsService.create(req.authUser!.id, req.body);
    res.status(201).json(successResponse('Loan application submitted', data));
  },

  async list(req: Request, res: Response) {
    const data = await loanApplicationsService.listForCustomer(req.authUser!.id);
    res.json(successResponse('Loan applications fetched', data));
  },

  async detail(req: Request, res: Response) {
    const data = await loanApplicationsService.getByIdForCustomer(
      req.authUser!.id,
      String(req.params.id),
    );
    res.json(successResponse('Loan application fetched', data));
  },

  async status(req: Request, res: Response) {
    const data = await loanApplicationsService.statusForCustomer(
      req.authUser!.id,
      String(req.params.id),
    );
    res.json(successResponse('Loan application status fetched', data));
  },
};
