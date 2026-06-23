import { prisma } from '../../database/prisma';
import { maskPan } from '../../utils/pan-masking';
import { logger } from '../../config/logger';

export type BureauAuditActionType =
  | 'BUREAU_CHECK_INITIATED'
  | 'BUREAU_CHECK_SUCCESS'
  | 'BUREAU_CHECK_FAILED'
  | 'BUREAU_CHECK_RETRIED'
  | 'BUREAU_CHECK_CIRCUIT_OPEN'
  | 'CACHE_HIT'
  | 'CACHE_MISS';

export interface BureauAuditData {
  pan: string;
  dob: string;
  fullName: string;
  processingTime?: number;
  cacheStatus?: 'HIT' | 'MISS' | 'SET';
  retryCount?: number;
  circuitBreakerState?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  creditScore?: number;
  bureauReferenceId?: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs bureau operations to AuditLog table
 */
export async function logBureauAudit(
  actionType: BureauAuditActionType,
  data: BureauAuditData,
  traceId?: string,
): Promise<void> {
  try {
    const metadata = {
      ...data,
      pan: maskPan(data.pan),
      traceId,
      timestamp: new Date().toISOString(),
    };

    await prisma.auditLog.create({
      data: {
        actionType,
        module: 'CREDIT_BUREAU',
        metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    logger.debug(
      {
        actionType,
        module: 'CREDIT_BUREAU',
        metadata,
        traceId,
      },
      'Bureau audit logged',
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        actionType,
        traceId,
      },
      'Failed to log bureau audit',
    );
  }
}

/**
 * Generates audit summary for bureau check
 */
export function generateBureauAuditSummary(
  pan: string,
  dob: string,
  creditScore: number,
  processingTime: number,
): string {
  return `Bureau check for PAN ${maskPan(pan)}, DOB ${dob}, Score ${creditScore}, Time ${processingTime}ms`;
}
