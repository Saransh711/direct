import CircuitBreaker from 'opossum';
import { prisma } from '../../database/prisma';
import { env } from '../../config/env';
import { deterministicCreditScore, deterministicFailure } from '../../utils/credit-score';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function bureauOperation(userId: string, seed: string) {
  const startedAt = Date.now();
  await sleep(120 + (deterministicCreditScore(seed) % 300));

  if (deterministicFailure(seed)) {
    throw new Error('Simulated bureau outage');
  }

  const creditScore = deterministicCreditScore(seed);
  const processingTime = Date.now() - startedAt;

  return {
    creditScore,
    processingTime,
    summary: {
      delinquencies: creditScore < 650 ? 1 : 0,
      activeAccounts: 2 + (creditScore % 5),
      utilizationRatio: Number(((900 - creditScore) / 10 / 100).toFixed(2)),
    },
  };
}

const breaker = new CircuitBreaker(bureauOperation, {
  timeout: env.BUREAU_TIMEOUT_MS,
  errorThresholdPercentage: 50,
  resetTimeout: 5000,
});

export const creditBureauService = {
  async retrieveCreditReport(userId: string, seed: string) {
    const request = await prisma.creditBureauRequest.create({
      data: {
        userId,
        status: 'PENDING',
      },
    });

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= env.BUREAU_MAX_RETRIES; attempt += 1) {
      try {
        const bureau = await breaker.fire(userId, seed);
        const report = await prisma.creditReport.create({
          data: {
            userId,
            creditScore: bureau.creditScore,
            creditSummary: bureau.summary,
            bureauReference: `BUREAU-${userId.slice(0, 6)}-${Date.now()}`,
          },
        });

        await prisma.creditBureauRequest.update({
          where: { id: request.id },
          data: {
            status: 'SUCCESS',
            retryCount: attempt - 1,
            processingTime: bureau.processingTime,
          },
        });

        return report;
      } catch (error) {
        lastError = error as Error;
        if (attempt < env.BUREAU_MAX_RETRIES) {
          await sleep(100 * attempt);
        }
      }
    }

    await prisma.creditBureauRequest.update({
      where: { id: request.id },
      data: {
        status: 'FAILED',
        retryCount: env.BUREAU_MAX_RETRIES,
        failureReason: lastError?.message ?? 'Unknown failure',
      },
    });

    throw lastError ?? new Error('Unable to retrieve report');
  },

  async getLatestOrFetch(userId: string, seed: string) {
    const latest = await prisma.creditReport.findFirst({
      where: { userId },
      orderBy: { retrievedAt: 'desc' },
    });

    if (latest) {
      return latest;
    }

    return this.retrieveCreditReport(userId, seed);
  },
};
