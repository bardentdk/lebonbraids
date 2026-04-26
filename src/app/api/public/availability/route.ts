import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeAvailableSlots } from '@/lib/booking/slots';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const durationStr = searchParams.get('duration');

    if (!dateStr || !durationStr) {
        return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const date = new Date(dateStr);
    const duration = parseInt(durationStr, 10);

    if (Number.isNaN(date.getTime()) || Number.isNaN(duration) || duration <= 0) {
        return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const supabase = await createClient();

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [{ data: hours }, { data: timeOff }, { data: blocked }, { data: bookings }, { data: slotInterval }] =
        await Promise.all([
            supabase.from('business_hours').select('*'),
            supabase.from('time_off').select('*'),
            supabase
                .from('blocked_slots')
                .select('start_at, end_at')
                .gte('end_at', dayStart.toISOString())
                .lte('start_at', dayEnd.toISOString()),
            supabase
                .from('bookings')
                .select('start_at, end_at')
                .gte('start_at', dayStart.toISOString())
                .lte('end_at', dayEnd.toISOString())
                .in('status', ['pending', 'confirmed', 'in_progress']),
            supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'booking.slot_interval_minutes')
                .maybeSingle(),
        ]);

    const interval =
        typeof slotInterval?.value === 'number' ? slotInterval.value : 30;

    const slots = computeAvailableSlots({
        date,
        durationMinutes: duration,
        intervalMinutes: interval,
        businessHours: (hours || []) as Parameters<typeof computeAvailableSlots>[0]['businessHours'],
        timeOff: (timeOff || []) as Parameters<typeof computeAvailableSlots>[0]['timeOff'],
        blockedSlots: (blocked || []) as Parameters<typeof computeAvailableSlots>[0]['blockedSlots'],
        existingBookings: (bookings || []) as Parameters<typeof computeAvailableSlots>[0]['existingBookings'],
        minNoticeHours: 24,
        now: new Date(),
    });

    return NextResponse.json({
        slots: slots.map((s) => ({
            start: s.start.toISOString(),
            end: s.end.toISOString(),
            available: s.available,
        })),
    });
}