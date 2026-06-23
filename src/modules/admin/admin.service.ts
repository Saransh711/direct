import { AppError } from '../../common/errors';
import { prisma } from '../../database/prisma';
import { notificationsService } from '../notifications/notifications.service';

export const adminService = {
  async listApplications() {
    return prisma.loanApplication.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        loanProduct: true,
        eligibility: true,
        decision: true,
      },
    });
  },

  async getApplication(id: string) {
    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        user: true,
        loanProduct: true,
        eligibility: true,
        decision: true,
        disbursement: true,
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    return application;
  },

  async approve(applicationId: string, reviewedBy: string, decisionReason: string) {
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { eligibility: true },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (!application.eligibility?.eligibilityResult) {
      throw new AppError('Application failed eligibility checks', 400);
    }

    const decision = await prisma.$transaction(async (tx) => {
      const result = await tx.loanDecision.upsert({
        where: { applicationId },
        create: {
          applicationId,
          decision: 'APPROVED',
          decisionReason,
          reviewedBy,
        },
        update: {
          decision: 'APPROVED',
          decisionReason,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });

      await tx.loanApplication.update({
        where: { id: applicationId },
        data: { status: 'APPROVED' },
      });

      return result;
    });

    await notificationsService.publish(
      application.userId,
      'Loan approved',
      'Your loan application has been approved and is pending disbursement.',
      'LOAN_STATUS',
    );

    return decision;
  },

  async reject(applicationId: string, reviewedBy: string, decisionReason: string) {
    const application = await prisma.loanApplication.findUnique({ where: { id: applicationId } });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const decision = await prisma.$transaction(async (tx) => {
      const result = await tx.loanDecision.upsert({
        where: { applicationId },
        create: {
          applicationId,
          decision: 'REJECTED',
          decisionReason,
          reviewedBy,
        },
        update: {
          decision: 'REJECTED',
          decisionReason,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });

      await tx.loanApplication.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' },
      });

      return result;
    });

    await notificationsService.publish(
      application.userId,
      'Loan rejected',
      `Your loan application was rejected. Reason: ${decisionReason}`,
      'LOAN_STATUS',
    );

    return decision;
  },
};
