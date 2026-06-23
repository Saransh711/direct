import CircuitBreaker from 'opossum';
import { prisma } from '../../database/prisma';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import {
  deterministicCreditScore,
  deterministicFailure,
  generateCreditProfile,
} from '../../utils/credit-score';
import { generateApprovalRecommendation } from '../../utils/credit-recommendation';
import { maskPan } from '../../utils/pan-masking';
import type { CreditCheckRequest } from './credit-bureau.schemas';
import { logBureauAudit } from './bureau-audit';
import { logger } from '../../config/logger';

const BUREAU_CACHE_TTL = 86400; // 24 hours

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getBureauCacheKey(pan: string, dob: string): string {
  return `bureau:${pan}:${dob}`;
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
  async checkCredit(request: CreditCheckRequest, traceId?: string) {
    const startedAt = Date.now();
    const seed = `${request.pan}-${request.dob}`;
    const cacheKey = getBureauCacheKey(request.pan, request.dob);

    // Log the bureau check initiation
    logger.info(
      {
        traceId,
        pan: maskPan(request.pan),
        dob: request.dob,
        fullName: request.fullName,
      },
      'Bureau check initiated',
    );

    await logBureauAudit(
      'BUREAU_CHECK_INITIATED',
      {
        pan: request.pan,
        dob: request.dob,
        fullName: request.fullName,
      },
      traceId,
    );

    // Try to get from Redis cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(
          {
            traceId,
            pan: maskPan(request.pan),
            cacheStatus: 'HIT',
          },
          'Bureau report retrieved from cache',
        );

        await logBureauAudit(
          'CACHE_HIT',
          {
            pan: request.pan,
            dob: request.dob,
            fullName: request.fullName,
            cacheStatus: 'HIT',
          },
          traceId,
        );

        const cachedResponse = JSON.parse(cached);
        return {
          ...cachedResponse,
          cachedAt: cachedResponse.generatedAt,
          cached: true,
        };
      }

      await logBureauAudit(
        'CACHE_MISS',
        {
          pan: request.pan,
          dob: request.dob,
          fullName: request.fullName,
          cacheStatus: 'MISS',
        },
        traceId,
      );
    } catch (cacheError) {
      logger.warn(
        {
          traceId,
          error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
        },
        'Redis cache retrieval failed',
      );
      // Continue without cache
    }

    if (deterministicFailure(seed)) {
      logger.warn(
        {
          traceId,
          pan: maskPan(request.pan),
          reason: 'Simulated bureau outage',
        },
        'Bureau check failed',
      );

      await logBureauAudit(
        'BUREAU_CHECK_FAILED',
        {
          pan: request.pan,
          dob: request.dob,
          fullName: request.fullName,
          errorMessage: 'Simulated bureau outage',
        },
        traceId,
      );

      throw new Error('Bureau service temporarily unavailable');
    }

    // Simulate processing delay
    await sleep(120 + (deterministicCreditScore(seed) % 300));

    // Generate credit profile
    const profile = generateCreditProfile(seed);
    const recommendation = generateApprovalRecommendation(profile.creditScore);
    const processingTime = Date.now() - startedAt;
    const bureauReferenceId = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Prepare response
    const response = {
      bureau: 'SIMULATED' as const,
      bureauReferenceId,
      creditScore: profile.creditScore,
      scoreBand: profile.scoreBand,
      paymentHistory: profile.paymentHistory,
      activeLoans: profile.activeLoans,
      closedLoans: profile.closedLoans,
      recentInquiries: profile.recentInquiries,
      creditAgeYears: profile.creditAgeYears,
      creditUtilization: profile.creditUtilization,
      missedPayments: profile.missedPayments,
      totalOutstanding: profile.totalOutstanding,
      totalCreditLimit: profile.totalCreditLimit,
      accountMix: profile.accountMix,
      generatedAt: new Date().toISOString(),
      approvalProbability: recommendation.approvalProbability,
      recommendation: recommendation.recommendation,
      cached: false,
    };

    // Store in Redis cache
    try {
      await redis.setex(cacheKey, BUREAU_CACHE_TTL, JSON.stringify(response));
      logger.info(
        {
          traceId,
          pan: maskPan(request.pan),
          cacheStatus: 'SET',
          ttl: BUREAU_CACHE_TTL,
        },
        'Bureau report cached',
      );
    } catch (cacheError) {
      logger.warn(
        {
          traceId,
          error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
        },
        'Redis cache storage failed',
      );
      // Continue without cache
    }

    // Skip DB record for public (unauthenticated) endpoint — no valid userId available

    logger.info(
      {
        traceId,
        pan: maskPan(request.pan),
        creditScore: profile.creditScore,
        processingTime,
        bureauReferenceId,
      },
      'Bureau check completed successfully',
    );

    await logBureauAudit(
      'BUREAU_CHECK_SUCCESS',
      {
        pan: request.pan,
        dob: request.dob,
        fullName: request.fullName,
        processingTime,
        creditScore: profile.creditScore,
        bureauReferenceId,
      },
      traceId,
    );

    return response;
  },

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
