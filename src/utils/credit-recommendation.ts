import { getScoreBand } from './credit-score';

export interface ApprovalRecommendation {
  approvalProbability: number;
  recommendation: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

/**
 * Generates lending recommendations based on credit score and band
 */
export function generateApprovalRecommendation(creditScore: number): ApprovalRecommendation {
  const scoreBand = getScoreBand(creditScore);

  switch (scoreBand) {
    case 'EXCELLENT': // 800-900
      return {
        approvalProbability: 95,
        recommendation:
          'Strong candidate for approval. Eligible for premium products with competitive rates.',
        riskLevel: 'LOW',
      };

    case 'VERY_GOOD': // 750-799
      return {
        approvalProbability: 85,
        recommendation:
          'Highly eligible for standard products. Expect favorable terms and quick processing.',
        riskLevel: 'LOW',
      };

    case 'GOOD': // 650-749
      return {
        approvalProbability: 80,
        recommendation: 'Eligible under standard lending policy. Review will proceed as scheduled.',
        riskLevel: 'MEDIUM',
      };

    case 'FAIR': // 550-649
      return {
        approvalProbability: 55,
        recommendation:
          'Additional review recommended. May require co-applicant or additional collateral.',
        riskLevel: 'HIGH',
      };

    case 'POOR': // 300-549
      return {
        approvalProbability: 20,
        recommendation:
          'High-risk applicant. May be declined or require significant additional documentation.',
        riskLevel: 'VERY_HIGH',
      };

    default:
      return {
        approvalProbability: 50,
        recommendation: 'Standard review process applies.',
        riskLevel: 'MEDIUM',
      };
  }
}

/**
 * Generates detailed lending insights based on credit profile
 */
export interface LendingInsights {
  recommendation: ApprovalRecommendation;
  nextSteps: string[];
  documentationRequired: string[];
}

export function generateLendingInsights(creditScore: number): LendingInsights {
  const recommendation = generateApprovalRecommendation(creditScore);
  const scoreBand = getScoreBand(creditScore);

  const nextSteps: string[] = [];
  const documentationRequired: string[] = [];

  // Add base documentation
  documentationRequired.push('Valid PAN and Aadhaar', 'Address Proof', 'Income Proof');

  if (scoreBand === 'EXCELLENT' || scoreBand === 'VERY_GOOD') {
    nextSteps.push('Quick processing expected', 'Rate negotiation available');
    documentationRequired.push('Last 3 months bank statements');
  } else if (scoreBand === 'GOOD') {
    nextSteps.push('Standard processing', 'Verification call may be scheduled');
    documentationRequired.push('Last 6 months bank statements', 'Employment letter');
  } else if (scoreBand === 'FAIR') {
    nextSteps.push(
      'Enhanced due diligence',
      'Co-applicant may be required',
      'Additional verification needed',
    );
    documentationRequired.push(
      'Last 12 months bank statements',
      'Detailed employment history',
      'Co-applicant documents',
    );
  } else {
    nextSteps.push(
      'Manual review required',
      'Phone call from underwriting team',
      'Additional documentation may be requested',
    );
    documentationRequired.push(
      'Complete financial disclosures',
      'Collateral documents',
      'Legal review',
    );
  }

  return {
    recommendation,
    nextSteps,
    documentationRequired,
  };
}
