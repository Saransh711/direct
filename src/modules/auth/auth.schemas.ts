import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email(),
    phoneNumber: z.string().min(8).max(20),
    password: z.string().min(12),
    confirmPassword: z.string().min(12),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password confirmation does not match',
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
