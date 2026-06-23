import { Router } from 'express';
import { auditTrail } from '../../middleware/audit.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerSchema),
  auditTrail('auth', 'REGISTER'),
  authController.register,
);
authRouter.post(
  '/login',
  validateBody(loginSchema),
  auditTrail('auth', 'LOGIN'),
  authController.login,
);
authRouter.post('/refresh', auditTrail('auth', 'REFRESH_TOKEN'), authController.refresh);
authRouter.post('/logout', auditTrail('auth', 'LOGOUT'), authController.logout);
authRouter.post('/logout-all', auditTrail('auth', 'LOGOUT_ALL'), authController.logoutAll);
authRouter.post(
  '/admin/login',
  validateBody(loginSchema),
  auditTrail('auth', 'ADMIN_LOGIN'),
  authController.adminLogin,
);
