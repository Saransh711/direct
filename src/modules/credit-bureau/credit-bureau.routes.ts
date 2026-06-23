import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { creditBureauController } from './credit-bureau.controller';

export const creditBureauRouter = Router();

creditBureauRouter.post('/credit-bureau/check', creditBureauController.check);

// Keep legacy route for backward compatibility while supporting namespaced route.
creditBureauRouter.get('/credit-score', authenticate, creditBureauController.score);
creditBureauRouter.get('/credit-bureau/credit-score', authenticate, creditBureauController.score);
