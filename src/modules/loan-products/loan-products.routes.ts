import { Router } from 'express';
import { loanProductController } from './loan-products.controller';

export const loanProductsRouter = Router();

loanProductsRouter.get('/loan-products', loanProductController.list);
