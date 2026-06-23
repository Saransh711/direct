import { AppError } from '../../common/errors';
import { prisma } from '../../database/prisma';
import { creditBureauService } from '../credit-bureau/credit-bureau.service';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export const eligibilityService = {
  async check(userId: string, applicationId: string) {
    const application = await prisma.loanApplication.findFirst({
      where: { id: applicationId, userId, deletedAt: null },
      include: { loanProduct: true },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const seed = `${user?.email ?? userId}-${user?.phoneNumber ?? ''}`;
    const creditReport = await creditBureauService.getLatestOrFetch(userId, seed);

    const monthlyIncome = Number(application.monthlyIncome);
    const obligations = Number(application.existingObligations);
    const requestedAmount = Number(application.requestedAmount);
    const dti = monthlyIncome === 0 ? 1 : obligations / monthlyIncome;

    const reasons: string[] = [];
    const conditions: string[] = [];

    if (creditReport.creditScore < 600) {
      reasons.push('Credit score below policy threshold');
    }
    if (dti > 0.55) {
      reasons.push('Debt to income ratio exceeds maximum allowed threshold');
    }
    if (requestedAmount > monthlyIncome * 60) {
      reasons.push('Requested amount exceeds income multiplier policy');
    }
    if (
      !['SALARIED', 'SELF_EMPLOYED', 'GOVERNMENT', 'CONTRACTOR'].includes(
        application.employmentType.toUpperCase(),
      )
    ) {
      reasons.push('Employment type not supported by current policy');
    }

    if (creditReport.creditScore < 680 && creditReport.creditScore >= 600) {
      conditions.push('Co-applicant may be required');
    }
    if (dti > 0.4 && dti <= 0.55) {
      conditions.push('Reduce existing obligations before final approval');
    }

    const scoreComponent = (creditReport.creditScore - 350) / 550;
    const dtiPenalty = clamp(dti, 0, 1);
    const amountPenalty = clamp(requestedAmount / Math.max(monthlyIncome * 60, 1), 0, 1);
    let probability = 0.75 * scoreComponent + 0.15 * (1 - dtiPenalty) + 0.1 * (1 - amountPenalty);

    if (application.employmentType.toUpperCase() === 'GOVERNMENT') {
      probability += 0.05;
    }

    probability = clamp(probability, 0.01, 0.99);
    const eligible = reasons.length === 0;

    const assessment = await prisma.$transaction(async (tx) => {
      const record = await tx.eligibilityAssessment.upsert({
        where: { loanApplicationId: application.id },
        create: {
          loanApplicationId: application.id,
          eligibilityResult: eligible,
          approvalProbability: probability,
          debtToIncomeRatio: dti,
          reasons,
          conditions,
        },
        update: {
          eligibilityResult: eligible,
          approvalProbability: probability,
          debtToIncomeRatio: dti,
          reasons,
          conditions,
        },
      });

      await tx.loanApplication.update({
        where: { id: application.id },
        data: {
          status: eligible ? 'UNDER_REVIEW' : 'REJECTED',
        },
      });

      return record;
    });

    return {
      ...assessment,
      creditScore: creditReport.creditScore,
    };
  },
};
