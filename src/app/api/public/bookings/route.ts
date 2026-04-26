import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkBookingConflict } from '@/lib/booking/conflicts';

const publicBookingSchema = z.object({
  service_ids: z.array(z.string().uuid()).min(1),
  start_at: z.string().min(1),
  client_first_name: z.string().min(2),
  client_last_name: z.string().min(2),
  client_email: z.string().email(),
  client_phone: z.string().min(8),
  notes: z.string().max(2000).optional().or(z.literal('')),
  marketing_consent: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  // Récupère les services pour calcul + snapshot
  const supabase = createAdminClient();
  const { data: services, error: sErr } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes, deposit_amount')
    .in('id', data.service_ids)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  if (!services || services.length === 0) {
    return NextResponse.json({ error: 'Prestations introuvables' }, { status: 404 });
  }

  const totalDuration = services.reduce((sum, s) => sum + s.duration_minutes, 0);
  const subtotal = services.reduce((sum, s) => sum + Number(s.price), 0);
  const deposit = services.reduce((sum, s) => sum + Number(s.deposit_amount || 0), 0);
  const startAt = new Date(data.start_at);
  const endAt = new Date(startAt.getTime() + totalDuration * 60_000);

  // Conflit ?
  const { hasConflict } = await checkBookingConflict(startAt, endAt);
  if (hasConflict) {
    return NextResponse.json(
      { error: 'Ce créneau n\'est plus disponible. Choisissez-en un autre.' },
      { status: 409 }
    );
  }

  // Création booking via service role (bypass RLS pour clients non connectés)
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .insert({
      client_id: user?.id || null,
      client_first_name: data.client_first_name,
      client_last_name: data.client_last_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      duration_minutes: totalDuration,
      subtotal,
      total_amount: subtotal,
      deposit_required: deposit,
      status: 'pending',
      payment_status: 'unpaid',
      notes: data.notes || null,
    })
    .select('id, reference')
    .single();

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  // Insertion booking_services
  const items = services.map((s) => ({
    booking_id: booking.id,
    service_id: s.id,
    service_name: s.name,
    service_price: s.price,
    service_duration_minutes: s.duration_minutes,
    quantity: 1,
  }));
  const { error: bsErr } = await supabase.from('booking_services').insert(items);
  if (bsErr) {
    await supabase.from('bookings').delete().eq('id', booking.id);
    return NextResponse.json({ error: bsErr.message }, { status: 500 });
  }

  // Met à jour le consentement marketing si client connecté
  if (user && data.marketing_consent) {
    await supabase
      .from('profiles')
      .update({ marketing_consent: true })
      .eq('id', user.id);
  }

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    reference: booking.reference,
  });
}