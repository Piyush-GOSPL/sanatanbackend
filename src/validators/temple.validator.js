import { z } from 'zod';

export const templeStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Delist', 'Reject']),
});

export const templeCreateSchema = z.object({
  mandir_name: z.string().min(1),
  full_address: z.string().min(1),
  city_id: z.coerce.number().int().positive(),
  year_established: z.coerce.number().int().positive().optional(),
  main_deity_id: z.coerce.number().int().positive(),
  description: z.string().min(1),
  phone_no: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  opening_hours: z.string().min(1),
  service_offered: z.union([z.array(z.string()), z.string()]).optional(),
  facilities_offered: z.union([z.array(z.string()), z.string()]).optional(),
  your_name: z.string().min(1),
  your_email: z.string().email(),
  rating: z.coerce.number().min(0).max(5).optional(),
  location: z.string().min(1),
  status: z.enum(['Pending', 'Approved', 'Delist', 'Reject']).optional(),
});

export const templeUpdateSchema = templeCreateSchema.partial();