import { AppError } from '../../common/errors';
import { prisma } from '../../database/prisma';

export const notificationsService = {
  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  async publish(
    userId: string,
    title: string,
    message: string,
    type: 'SYSTEM' | 'LOAN_STATUS' | 'SECURITY' | 'DISBURSEMENT' = 'SYSTEM',
  ) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  },
};
