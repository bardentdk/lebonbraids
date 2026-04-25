import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(['in', 'out', 'adjustment', 'loss']),
  quantity: z.coerce.number().int().refine((n) => n !== 0, 'Quantité requise'),
  reason: z.string().min(2).max(200),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;