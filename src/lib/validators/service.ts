import { z } from 'zod';

export const serviceCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  slug: z.string().optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  icon: z.string().max(50).optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().nullable().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),

  name: z.string().min(2, 'Nom trop court').max(150, 'Nom trop long'),
  slug: z.string().optional(),
  short_description: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),

  price: z.coerce.number().min(0, 'Prix invalide'),
  deposit_amount: z.coerce.number().min(0).default(0),

  duration_minutes: z.coerce.number().int().min(15, 'Durée minimum 15 min'),
  preparation_minutes: z.coerce.number().int().min(0).default(0),
  cleanup_minutes: z.coerce.number().int().min(0).default(0),

  cover_image_url: z.string().url().optional().nullable().or(z.literal('')),

  meta_title: z.string().max(160).optional().or(z.literal('')),
  meta_description: z.string().max(300).optional().or(z.literal('')),

  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),

  max_bookings_per_day: z.coerce.number().int().min(1).optional().nullable(),
  advance_booking_days: z.coerce.number().int().min(1).default(60),
  min_notice_hours: z.coerce.number().int().min(0).default(24),

  sort_order: z.coerce.number().int().min(0).default(0),
});

export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;