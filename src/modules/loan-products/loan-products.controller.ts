import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { loanProductService } from './loan-products.service';

export const loanProductController = {
  async list(_req: Request, res: Response) {
    const data = await loanProductService.listActiveProducts();
    res.json(successResponse('Loan products fetched', data));
  },
};
