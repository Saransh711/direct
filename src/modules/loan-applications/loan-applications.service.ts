import { AppError } from '../../common/errors';
import { prisma } from '../../database/prisma';

export const loanApplicationsService = {
  async create(
    userId: string,
    payload: {
      loanProductId: string;
      requestedAmount: number;
      requestedTenure: number;
      employmentType: string;
      employerName?: string;
      monthlyIncome: number;
      existingObligations: number;
    },
  ) {
    const product = await prisma.loanProduct.findUnique({ where: { id: payload.loanProductId } });
    if (!product || !product.active) {
      throw new AppError('Loan product not available', 404);
    }

    if (
      payload.requestedAmount < Number(product.minAmount) ||
      payload.requestedAmount > Number(product.maxAmount)
    ) {
      throw new AppError('Requested amount outside product limits', 400);
    }

    if (
      payload.requestedTenure < product.minTenure ||
      payload.requestedTenure > product.maxTenure
    ) {
      throw new AppError('Requested tenure outside product limits', 400);
    }

    return prisma.loanApplication.create({
      data: {
        userId,
        loanProductId: payload.loanProductId,
        requestedAmount: payload.requestedAmount,
        requestedTenure: payload.requestedTenure,
        employmentType: payload.employmentType,
        employerName: payload.employerName,
        monthlyIncome: payload.monthlyIncome,
        existingObligations: payload.existingObligations,
        status: 'SUBMITTED',
      },
      include: {
        loanProduct: true,
      },
    });
  },

  async listForCustomer(userId: string) {
    return prisma.loanApplication.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        loanProduct: true,
        eligibility: true,
        decision: true,
        disbursement: true,
      },
    });
  },

  async getByIdForCustomer(userId: string, applicationId: string) {
    const application = await prisma.loanApplication.findFirst({
      where: { id: applicationId, userId, deletedAt: null },
      include: {
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

  async statusForCustomer(userId: string, applicationId: string) {
    const application = await prisma.loanApplication.findFirst({
      where: { id: applicationId, userId, deletedAt: null },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        decision: true,
        disbursement: true,
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    return application;
  },
};
