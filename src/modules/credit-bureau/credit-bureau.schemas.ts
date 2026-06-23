import { z } from 'zod';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const indianMobileRegex = /^[6-9]\d{9}$/;

export const creditCheckSchema = z
  .object({
    pan: z
      .string()
      .toUpperCase()
      .regex(panRegex, 'Invalid PAN format. Expected [A-Z]{5}[0-9]{4}[A-Z]{1}'),
    fullName: z.string().min(3, 'Full name must be at least 3 characters').max(100),
    dob: z.string().refine((val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime());
    }, 'Invalid date format'),
    mobile: z
      .string()
      .regex(
        indianMobileRegex,
        'Invalid Indian mobile number. Must be 10 digits starting with 6-9',
      ),
    consent: z.boolean().refine((value) => value === true, {
      message: 'Consent is required to proceed',
    }),
  })
  .refine(
    (data) => {
      const dob = new Date(data.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      const isAtLeast18 =
        age > 18 ||
        (age === 18 && monthDiff > 0) ||
        (age === 18 && monthDiff === 0 && dayDiff >= 0);

      return isAtLeast18;
    },
    {
      path: ['dob'],
      message: 'Applicant must be at least 18 years old',
    },
  );

export type CreditCheckRequest = z.infer<typeof creditCheckSchema>;
