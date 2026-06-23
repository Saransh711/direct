function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function derivedHash(seed: string, variant: number): number {
  const baseHash = hashSeed(seed);
  return Math.abs((baseHash * (variant + 1)) ^ (baseHash >> (variant % 10)));
}

export type ScoreBand = 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';
export type PaymentHistory = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
export type AccountType =
  | 'PERSONAL_LOAN'
  | 'HOME_LOAN'
  | 'AUTO_LOAN'
  | 'CREDIT_CARD'
  | 'CONSUMER_LOAN';

export function deterministicCreditScore(seed: string): number {
  const baseHash = hashSeed(seed);
  const normalized = Math.abs(baseHash % 451);
  return 350 + normalized;
}

export function deterministicFailure(seed: string): boolean {
  const score = deterministicCreditScore(seed);
  return score % 17 === 0;
}

export function getScoreBand(score: number): ScoreBand {
  if (score < 550) return 'POOR';
  if (score < 650) return 'FAIR';
  if (score < 750) return 'GOOD';
  if (score < 800) return 'VERY_GOOD';
  return 'EXCELLENT';
}

export interface CreditProfile {
  creditScore: number;
  scoreBand: ScoreBand;
  activeLoans: number;
  closedLoans: number;
  creditUtilization: number;
  recentInquiries: number;
  creditAgeYears: number;
  missedPayments: number;
  totalOutstanding: number;
  totalCreditLimit: number;
  paymentHistory: PaymentHistory;
  accountMix: AccountType[];
}

export function generateCreditProfile(seed: string): CreditProfile {
  const creditScore = deterministicCreditScore(seed);
  const scoreBand = getScoreBand(creditScore);

  // Generate all profile fields deterministically
  const hash1 = derivedHash(seed, 1);
  const hash2 = derivedHash(seed, 2);
  const hash3 = derivedHash(seed, 3);
  const hash4 = derivedHash(seed, 4);
  const hash5 = derivedHash(seed, 5);
  const hash6 = derivedHash(seed, 6);
  const hash7 = derivedHash(seed, 7);
  const hash8 = derivedHash(seed, 8);

  // Active Loans: 0-6 (correlate with score)
  const activeLoans = Math.abs(hash1 % 7);

  // Closed Loans: 0-15 (correlate with score)
  const closedLoans = Math.abs(hash2 % 16);

  // Credit Utilization: 5-95% (inverse correlation with score)
  const utilizationBase = Math.abs(hash3 % 91);
  const creditUtilization = 5 + utilizationBase;

  // Recent Inquiries: 0-8
  const recentInquiries = Math.abs(hash4 % 9);

  // Credit Age: 0-20 years (positive correlation with score)
  const creditAgeYears = Math.abs(hash5 % 21);

  // Missed Payments: 0-10 (negative correlation with score)
  const missedPayments = Math.abs(hash6 % 11);

  // Outstanding Amount: ₹0-₹20,00,000 (negative correlation with score)
  const outstandingBase = Math.abs(hash7 % 2000001);
  const totalOutstanding = Math.floor((outstandingBase / 100) * (100 - creditScore / 9)); // Adjust based on score

  // Total Credit Limit: ₹50,000-₹50,00,000
  const creditLimitBase = Math.abs(hash8 % 4950001);
  const totalCreditLimit = 50000 + creditLimitBase;

  // Payment History (based on score band)
  let paymentHistory: PaymentHistory;
  if (scoreBand === 'EXCELLENT') paymentHistory = 'EXCELLENT';
  else if (scoreBand === 'VERY_GOOD') paymentHistory = 'GOOD';
  else if (scoreBand === 'GOOD') paymentHistory = 'GOOD';
  else if (scoreBand === 'FAIR') paymentHistory = 'AVERAGE';
  else paymentHistory = 'POOR';

  // Account Mix (deterministic selection based on hash)
  const accountTypes: AccountType[] = [
    'PERSONAL_LOAN',
    'HOME_LOAN',
    'AUTO_LOAN',
    'CREDIT_CARD',
    'CONSUMER_LOAN',
  ];
  const accountMixCount = Math.abs(hash1 % 3) + 1; // 1-3 account types
  const accountMix: AccountType[] = [];
  for (let i = 0; i < accountMixCount; i += 1) {
    const idx = Math.abs((hash1 + i) % accountTypes.length);
    const candidate = accountTypes[idx];
    if (candidate && !accountMix.includes(candidate)) {
      accountMix.push(candidate);
    }
  }

  return {
    creditScore,
    scoreBand,
    activeLoans,
    closedLoans,
    creditUtilization,
    recentInquiries,
    creditAgeYears,
    missedPayments,
    totalOutstanding,
    totalCreditLimit,
    paymentHistory,
    accountMix,
  };
}
