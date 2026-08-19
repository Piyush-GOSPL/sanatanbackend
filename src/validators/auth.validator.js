import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const logoutSchema = z.object({
  refresh: z.string().min(1, 'Refresh token is required'),
});
