import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { usersController } from './users.controller';
import { updateProfileSchema } from './users.schemas';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.me);
usersRouter.patch('/me', authenticate, validateBody(updateProfileSchema), usersController.updateMe);
usersRouter.get('/loan-history', authenticate, usersController.loanHistory);
