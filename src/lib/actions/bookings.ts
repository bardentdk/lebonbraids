'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { bookingSchema, type BookingInput } from '@/lib/validators/booking';
import { checkBookingConflict } from '@/lib/booking/conflicts';

async function ensureStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    throw new Error('Accès refusé');
  }
  return { supabase, user };
}

export async function listBookings(opts?: {
  from?: string;
  to?: string;
  status?: string;
  search?: string;
}) {
  const supabase = await createClient();
  let req = supabase
    .from('bookings')
    .select(
      `
      *,
      services:booking_services (
        id,
        service_name,
        service_price,
        service_duration_minutes,
        quantity,
        service_id
      )
    `
    )
    .order('start_at', { ascending: false });

  if (opts?.from) req = req.gte('start_at', opts.from);
  if (opts?.to) req = req.lte('start_at', opts.to);
  if (opts?.status && opts.status !== 'all') req = req.eq('status', opts.status);
  if (opts?.search) {
    req = req.or(
      `client_first_name.ilike.%${opts.search}%,client_last_name.ilike.%${opts.search}%,client_email.ilike.%${opts.search}%,reference.ilike.%${opts.search}%`
    );
  }

  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return data;
}

export async function getBooking(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      services:booking_services (
        id,
        service_name,
        service_price,
        service_duration_minutes,
        quantity,
        service_id,
        service:services (id, name, slug, cover_image_url)
      ),
      client:profiles (id, first_name, last_name, email, phone, total_bookings, total_spent)
    `
    )
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createBooking(input: BookingInput) {
  const { supabase } = await ensureStaff();
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const startAt = new Date(data.start_at);
  const endAt = new Date(data.end_at);

  // Détection de conflit
  const { hasConflict: conflict } = await checkBookingConflict(startAt, endAt);
  if (conflict) {
    return {
      success: false as const,
      error: 'Conflit avec une autre réservation sur ce créneau',
    };
  }

  // Récupère les prestations pour faire le snapshot
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes, deposit_amount')
    .in('id', data.service_ids);

  if (servicesError) {
    return { success: false as const, error: servicesError.message };
  }
  if (!services || services.length === 0) {
    return { success: false as const, error: 'Prestations introuvables' };
  }

  const subtotal = services.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );
  const totalDeposit = services.reduce(
    (sum, s) => sum + Number(s.deposit_amount || 0),
    0
  );
  const total = subtotal - data.discount_amount;

  // Insertion booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      client_id: data.client_id || null,
      client_first_name: data.client_first_name,
      client_last_name: data.client_last_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      duration_minutes: totalDuration,
      subtotal,
      discount_amount: data.discount_amount,
      total_amount: total,
      deposit_required: totalDeposit,
      deposit_paid: data.deposit_paid,
      status: data.status,
      payment_status: data.payment_status,
      notes: data.notes || null,
      internal_notes: data.internal_notes || null,
    })
    .select('id')
    .single();

  if (bookingError) {
    return { success: false as const, error: bookingError.message };
  }

  // Insertion booking_services
  const bookingServicesPayload = services.map((s) => ({
    booking_id: booking.id,
    service_id: s.id,
    service_name: s.name,
    service_price: s.price,
    service_duration_minutes: s.duration_minutes,
    quantity: 1,
  }));

  const { error: bsError } = await supabase
    .from('booking_services')
    .insert(bookingServicesPayload);

  if (bsError) {
    await supabase.from('bookings').delete().eq('id', booking.id);
    return { success: false as const, error: bsError.message };
  }

  revalidatePath('/admin/planning');
  revalidatePath('/admin/reservations');
  return { success: true as const, id: booking.id };
}

export async function updateBooking(input: BookingInput & { id: string }) {
  const { supabase } = await ensureStaff();
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const startAt = new Date(data.start_at);
  const endAt = new Date(data.end_at);

  const { hasConflict: conflict } = await checkBookingConflict(
    startAt,
    endAt,
    data.id
  );
  if (conflict) {
    return {
      success: false as const,
      error: 'Conflit avec une autre réservation sur ce créneau',
    };
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      client_first_name: data.client_first_name,
      client_last_name: data.client_last_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: data.status,
      payment_status: data.payment_status,
      discount_amount: data.discount_amount,
      total_amount: data.total_amount,
      deposit_required: data.deposit_required,
      deposit_paid: data.deposit_paid,
      notes: data.notes || null,
      internal_notes: data.internal_notes || null,
    })
    .eq('id', data.id);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath('/admin/planning');
  revalidatePath('/admin/reservations');
  revalidatePath(`/admin/reservations/${data.id}`);
  return { success: true as const, id: data.id };
}

export async function updateBookingStatus(
  id: string,
  status: BookingInput['status']
) {
  const { supabase } = await ensureStaff();
  const updates: Record<string, unknown> = { status };
  if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }
  const { error } = await supabase.from('bookings').update(updates).eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  revalidatePath('/admin/reservations');
  revalidatePath(`/admin/reservations/${id}`);
  return { success: true as const };
}

export async function moveBooking(
  id: string,
  newStartAt: string,
  newEndAt: string
) {
  const { supabase } = await ensureStaff();
  const startAt = new Date(newStartAt);
  const endAt = new Date(newEndAt);

  const { hasConflict: conflict } = await checkBookingConflict(
    startAt,
    endAt,
    id
  );
  if (conflict) {
    return {
      success: false as const,
      error: 'Conflit avec une autre réservation',
    };
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
    })
    .eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  return { success: true as const };
}

export async function deleteBooking(id: string) {
  const { supabase } = await ensureStaff();
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  revalidatePath('/admin/reservations');
  return { success: true as const };
}