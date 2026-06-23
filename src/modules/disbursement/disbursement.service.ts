import { randomUUID } from 'crypto';
import { AppError } from '../../common/errors';
import { prisma } from '../../database/prisma';
import { notificationsService } from '../notifications/notifications.service';

export const disbursementService = {
  async disburse(applicationId: string, adminId: string) {
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { disbursement: true, user: true },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.status !== 'APPROVED') {
      throw new AppError('Only approved applications can be disbursed', 400);
    }

    if (application.disbursement) {
      throw new AppError('Application already disbursed', 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      const disbursement = await tx.loanDisbursement.create({
        data: {
          applicationId,
          amount: application.requestedAmount,
          disbursedBy: adminId,
          referenceNumber: `DISB-${Date.now()}-${randomUUID().slice(0, 8)}`,
        },
      });

      await tx.loanApplication.update({
        where: { id: applicationId },
        data: { status: 'DISBURSED' },
      });

      return disbursement;
    });

    await notificationsService.publish(
      application.userId,
      'Loan disbursed',
      `Your loan has been disbursed with reference ${result.referenceNumber}`,
      'DISBURSEMENT',
    );

    return result;
  },
};
