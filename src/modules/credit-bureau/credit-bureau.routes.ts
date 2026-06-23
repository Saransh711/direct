import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { creditBureauController } from './credit-bureau.controller';

export const creditBureauRouter = Router();

creditBureauRouter.get('/credit-score', authenticate, creditBureauController.score);
