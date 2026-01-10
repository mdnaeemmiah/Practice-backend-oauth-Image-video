import { z } from 'zod';
import { DoctorStatus, Specializations } from './doctor.constant';

export const createDoctorValidationSchema = z.object({
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
    specialization: z
      .enum([...Specializations] as [string, ...string[]])
      .optional(),
    experience: z.number().min(0).optional(),
    qualification: z.string().optional(),
  }),
});

export const updateDoctorValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'Name must be at least 3 characters long' })
      .trim()
      .optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    specialization: z
      .enum([...Specializations] as [string, ...string[]])
      .optional(),
    experience: z.number().min(0).optional(),
    qualification: z.string().optional(),
  }),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...DoctorStatus] as [string, ...string[]]),
  }),
});

export const DoctorValidation = {
  createDoctorValidationSchema,
  updateDoctorValidationSchema,
  changeStatusValidationSchema,
};
