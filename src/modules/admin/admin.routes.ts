import { Router } from 'express';
import { Roles } from '../../common/roles';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { adminController } from './admin.controller';
import { dashboardService } from '../dashboard/dashboard.service';
import { successResponse } from '../../common/api-response';
import { auditController } from '../audit/audit.controller';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize(Roles.ADMIN, Roles.SUPER_ADMIN));

adminRouter.get('/applications', adminController.listApplications);
adminRouter.get('/applications/:id', adminController.getApplication);
adminRouter.post('/applications/:id/approve', adminController.approve);
adminRouter.post('/applications/:id/reject', adminController.reject);
adminRouter.post('/disbursements/:id', adminController.disburse);
adminRouter.get('/audit-logs', auditController.list);
adminRouter.get('/dashboard', async (_req, res) => {
  const data = await dashboardService.metrics();
  res.json(successResponse('Dashboard metrics fetched', data));
});
