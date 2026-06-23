import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { notificationsService } from './notifications.service';

export const notificationsController = {
  async list(req: Request, res: Response) {
    const data = await notificationsService.list(req.authUser!.id);
    res.json(successResponse('Notifications fetched', data));
  },

  async markRead(req: Request, res: Response) {
    const data = await notificationsService.markRead(req.authUser!.id, String(req.params.id));
    res.json(successResponse('Notification marked as read', data));
  },
};
