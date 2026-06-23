import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { loanApplicationsController } from './loan-applications.controller';
import { createLoanApplicationSchema } from './loan-applications.schemas';

export const loanApplicationsRouter = Router();

loanApplicationsRouter.post(
  '/loan-applications',
  authenticate,
  validateBody(createLoanApplicationSchema),
  loanApplicationsController.create,
);
loanApplicationsRouter.get('/loan-applications', authenticate, loanApplicationsController.list);
loanApplicationsRouter.get(
  '/loan-applications/:id',
  authenticate,
  loanApplicationsController.detail,
);
loanApplicationsRouter.get(
  '/loan-applications/:id/status',
  authenticate,
  loanApplicationsController.status,
);
