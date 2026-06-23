import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { eligibilityController } from './eligibility.controller';
import { eligibilityCheckSchema } from './eligibility.schemas';

export const eligibilityRouter = Router();

eligibilityRouter.post(
  '/eligibility/check',
  authenticate,
  validateBody(eligibilityCheckSchema),
  eligibilityController.check,
);
