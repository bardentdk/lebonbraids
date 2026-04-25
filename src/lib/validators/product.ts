import { z } from 'zod';

export const productCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  icon: z.string().max(50).optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().nullable().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),

  sku: z.string().max(50).optional().or(z.literal('')),
  barcode: z.string().max(50).optional().or(z.literal('')),
  name: z.string().min(2).max(150),
  slug: z.string().optional(),

  short_description: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  ingredients: z.string().max(2000).optional().or(z.literal('')),
  usage_instructions: z.string().max(2000).optional().or(z.literal('')),

  price: z.coerce.number().min(0),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  cost_price: z.coerce.number().min(0).optional().nullable(),

  stock_quantity: z.coerce.number().int().min(0).default(0),
  stock_alert_threshold: z.coerce.number().int().min(0).default(5),
  track_stock: z.boolean().default(true),
  allow_backorder: z.boolean().default(false),

  weight_grams: z.coerce.number().int().min(0).optional().nullable(),

  cover_image_url: z.string().url().optional().nullable().or(z.literal('')),

  meta_title: z.string().max(160).optional().or(z.literal('')),
  meta_description: z.string().max(300).optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),

  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(true),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;
export type ProductInput = z.infer<typeof productSchema>;