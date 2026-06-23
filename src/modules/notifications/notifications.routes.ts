import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { notificationsController } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/notifications', authenticate, notificationsController.list);
notificationsRouter.patch(
  '/notifications/:id/read',
  authenticate,
  notificationsController.markRead,
);
