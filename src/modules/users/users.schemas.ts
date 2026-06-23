import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().min(8).max(20).optional(),
});
