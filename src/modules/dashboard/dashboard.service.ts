import { prisma } from '../../database/prisma';

export const dashboardService = {
  async metrics() {
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      disbursedLoans,
      decisions,
      eligibility,
      creditReports,
    ] = await Promise.all([
      prisma.loanApplication.count({ where: { deletedAt: null } }),
      prisma.loanApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }, deletedAt: null },
      }),
      prisma.loanApplication.count({ where: { status: 'APPROVED', deletedAt: null } }),
      prisma.loanApplication.count({ where: { status: 'REJECTED', deletedAt: null } }),
      prisma.loanDisbursement.count(),
      prisma.loanDecision.findMany({
        include: { application: true },
      }),
      prisma.eligibilityAssessment.findMany(),
      prisma.creditReport.findMany(),
    ]);

    const avgApprovalTimeHours = decisions.length
      ? decisions.reduce((sum, decision) => {
          const duration =
            decision.reviewedAt.getTime() - decision.application.submittedAt.getTime();
          return sum + duration / (1000 * 60 * 60);
        }, 0) / decisions.length
      : 0;

    const eligibilityTrends = {
      eligible: eligibility.filter((row) => row.eligibilityResult).length,
      ineligible: eligibility.filter((row) => !row.eligibilityResult).length,
    };

    const creditScoreDistribution = {
      low: creditReports.filter((row) => row.creditScore < 600).length,
      medium: creditReports.filter((row) => row.creditScore >= 600 && row.creditScore < 750).length,
      high: creditReports.filter((row) => row.creditScore >= 750).length,
    };

    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      disbursedLoans,
      averageApprovalTimeHours: Number(avgApprovalTimeHours.toFixed(2)),
      eligibilityTrends,
      creditScoreDistribution,
    };
  },
};
