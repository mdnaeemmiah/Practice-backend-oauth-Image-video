import { z } from 'zod';
import { AdminStatus } from './admin.constant';

export const createAdminValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'Name must be at least 3 characters long' })
      .nonempty({ message: 'Name is required' })
      .trim(),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const updateAdminValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'Name must be at least 3 characters long' })
      .trim()
      .optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...AdminStatus] as [string, ...string[]]),
  }),
});

export const AdminValidation = {
  createAdminValidationSchema,
  updateAdminValidationSchema,
  changeStatusValidationSchema,
};
