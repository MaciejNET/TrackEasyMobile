import { z } from 'zod';

// Login form schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration form schema
export const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  dateOfBirth: z.string()
    .min(1, { message: 'Date of birth is required' })
    .regex(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { 
      message: 'Please use MM/DD/YYYY format' 
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// API schemas
export const createPassengerCommandSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'Date must be in YYYY-MM-DD format' 
  }),
});

export type CreatePassengerCommand = z.infer<typeof createPassengerCommandSchema>;

export const generateTokenCommandSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type GenerateTokenCommand = z.infer<typeof generateTokenCommandSchema>;

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.string(),
  operatorId: z.string().uuid().nullable(),
});

export type UserDto = z.infer<typeof userDtoSchema>;