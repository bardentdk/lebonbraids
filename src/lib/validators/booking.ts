import { z } from 'zod';

export const bookingStatusEnum = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

export const paymentStatusEnum = z.enum([
  'unpaid',
  'deposit_paid',
  'paid',
  'refunded',
  'partial_refund',
]);

export const bookingSchema = z.object({
  id: z.string().uuid().optional(),

  // Client (snapshot)
  client_id: z.string().uuid().nullable().optional(),
  client_first_name: z.string().min(2, 'Prénom requis'),
  client_last_name: z.string().min(2, 'Nom requis'),
  client_email: z.string().email('Email invalide'),
  client_phone: z.string().min(8, 'Téléphone invalide'),

  // Créneau
  start_at: z.string().min(1, 'Date de début requise'),
  end_at: z.string().min(1, 'Date de fin requise'),

  // Prestations (au moins une)
  service_ids: z.array(z.string().uuid()).min(1, 'Sélectionne au moins une prestation'),

  // Statuts
  status: bookingStatusEnum.default('confirmed'),
  payment_status: paymentStatusEnum.default('unpaid'),

  // Tarification
  subtotal: z.coerce.number().min(0).optional(),
  discount_amount: z.coerce.number().min(0).default(0),
  total_amount: z.coerce.number().min(0).optional(),
  deposit_required: z.coerce.number().min(0).default(0),
  deposit_paid: z.coerce.number().min(0).default(0),

  // Notes
  notes: z.string().max(2000).optional().or(z.literal('')),
  internal_notes: z.string().max(2000).optional().or(z.literal('')),
});

export const blockedSlotSchema = z.object({
  start_at: z.string().min(1),
  end_at: z.string().min(1),
  reason: z.string().max(200).optional().or(z.literal('')),
});

export const timeOffSchema = z
  .object({
    start_date: z.string().min(1, 'Date de début requise'),
    end_date: z.string().min(1, 'Date de fin requise'),
    reason: z.string().max(200).optional().or(z.literal('')),
    is_all_day: z.boolean().default(true),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
  })
  .refine((d) => new Date(d.end_date) >= new Date(d.start_date), {
    message: 'La date de fin doit être après la date de début',
    path: ['end_date'],
  });

export type BookingInput = z.infer<typeof bookingSchema>;
export type BlockedSlotInput = z.infer<typeof blockedSlotSchema>;
export type TimeOffInput = z.infer<typeof timeOffSchema>;