import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { authController } from '../modules/auth/auth.controller';
import { loginSchema } from '../modules/auth/auth.schemas';
import { usersRouter } from '../modules/users/users.routes';
import { loanApplicationsRouter } from '../modules/loan-applications/loan-applications.routes';
import { eligibilityRouter } from '../modules/eligibility/eligibility.routes';
import { creditBureauRouter } from '../modules/credit-bureau/credit-bureau.routes';
import { adminRouter } from '../modules/admin/admin.routes';
import { notificationsRouter } from '../modules/notifications/notifications.routes';
import { loanProductsRouter } from '../modules/loan-products/loan-products.routes';
import { validateBody } from '../middleware/validate.middleware';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);

apiRouter.post('/admin/login', validateBody(loginSchema), authController.adminLogin);
apiRouter.use(usersRouter);
apiRouter.use(loanProductsRouter);
apiRouter.use(loanApplicationsRouter);
apiRouter.use(eligibilityRouter);
apiRouter.use(creditBureauRouter);
apiRouter.use(notificationsRouter);
apiRouter.use('/admin', adminRouter);
