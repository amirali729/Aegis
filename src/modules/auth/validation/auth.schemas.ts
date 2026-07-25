import { z } from 'zod';

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be at most 30 characters.')
  .regex(/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, numbers, and underscores.');

const emailSchema = z.string().trim().toLowerCase().email('Must be a valid email address.');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.');

export const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required.'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password.'),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password.'),
});
