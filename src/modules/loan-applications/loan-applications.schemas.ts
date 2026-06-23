import { z } from 'zod';

const UUID_CANONICAL_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createLoanApplicationSchema = z.object({
  // Accept canonical UUID strings that match DB IDs, including legacy seeded values.
  loanProductId: z.string().regex(UUID_CANONICAL_REGEX, 'Invalid UUID'),
  requestedAmount: z.coerce.number().positive(),
  requestedTenure: z.coerce.number().int().positive(),
  employmentType: z.string().min(2).max(100),
  employerName: z.string().max(200).optional(),
  monthlyIncome: z.coerce.number().positive(),
  existingObligations: z.coerce.number().min(0),
});
