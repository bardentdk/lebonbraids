import { createClient } from '@/lib/supabase/server';
import { hasConflict, type ExistingBooking } from './slots';

export async function checkBookingConflict(
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBookings: ExistingBooking[] }> {
  const supabase = await createClient();

  const dayBefore = new Date(startAt);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter = new Date(endAt);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, start_at, end_at')
    .gte('start_at', dayBefore.toISOString())
    .lte('end_at', dayAfter.toISOString())
    .in('status', ['pending', 'confirmed', 'in_progress']);

  if (error) throw new Error(error.message);

  const filtered = (bookings || []).filter((b) => b.id !== excludeBookingId);
  const conflicts = filtered.filter((b) => {
    const bStart = new Date(b.start_at);
    const bEnd = new Date(b.end_at);
    return startAt < bEnd && endAt > bStart;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflictingBookings: conflicts,
  };
}