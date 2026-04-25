import {
  addMinutes,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  parseISO,
  set,
  format,
} from 'date-fns';

export interface BusinessHours {
  day_of_week: number; // 0 = dimanche
  opens_at: string;    // "09:00"
  closes_at: string;   // "19:00"
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

export interface TimeOff {
  start_date: string; // ISO
  end_date: string;
  is_all_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

export interface BlockedSlot {
  start_at: string; // ISO
  end_at: string;
}

export interface ExistingBooking {
  start_at: string;
  end_at: string;
}

export interface Slot {
  start: Date;
  end: Date;
  available: boolean;
}

interface ComputeSlotsOptions {
  date: Date;
  durationMinutes: number;
  intervalMinutes?: number;
  businessHours: BusinessHours[];
  timeOff: TimeOff[];
  blockedSlots: BlockedSlot[];
  existingBookings: ExistingBooking[];
  minNoticeHours?: number;
  now?: Date;
}

/**
 * Convertit "HH:mm" en Date pour un jour donné
 */
function timeStringToDate(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  return set(date, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
}

/**
 * Vérifie si un intervalle [a, b] chevauche [c, d]
 */
function overlaps(a: Date, b: Date, c: Date, d: Date): boolean {
  return isBefore(a, d) && isAfter(b, c);
}

/**
 * Calcule les créneaux pour un jour donné en respectant toutes les contraintes.
 */
export function computeAvailableSlots(opts: ComputeSlotsOptions): Slot[] {
  const {
    date,
    durationMinutes,
    intervalMinutes = 30,
    businessHours,
    timeOff,
    blockedSlots,
    existingBookings,
    minNoticeHours = 0,
    now = new Date(),
  } = opts;

  const dayOfWeek = date.getDay();
  const hours = businessHours.find((h) => h.day_of_week === dayOfWeek);

  if (!hours || hours.is_closed) return [];

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Vérif congés couvrant tout le jour
  const onTimeOff = timeOff.some((t) => {
    const start = parseISO(t.start_date);
    const end = parseISO(t.end_date);
    return (
      t.is_all_day &&
      !isBefore(date, startOfDay(start)) &&
      !isAfter(date, endOfDay(end))
    );
  });
  if (onTimeOff) return [];

  const opens = timeStringToDate(date, hours.opens_at);
  const closes = timeStringToDate(date, hours.closes_at);
  const breakStart = hours.break_start
    ? timeStringToDate(date, hours.break_start)
    : null;
  const breakEnd = hours.break_end
    ? timeStringToDate(date, hours.break_end)
    : null;

  const minBookableTime = addMinutes(now, minNoticeHours * 60);

  const slots: Slot[] = [];
  let cursor = opens;

  while (
    !isAfter(addMinutes(cursor, durationMinutes), closes)
  ) {
    const slotEnd = addMinutes(cursor, durationMinutes);

    // Pause déjeuner ?
    const inBreak =
      breakStart && breakEnd && overlaps(cursor, slotEnd, breakStart, breakEnd);

    // Délai mini
    const tooSoon = isBefore(cursor, minBookableTime);

    // Congé partiel ?
    const inPartialTimeOff = timeOff.some((t) => {
      if (t.is_all_day || !t.start_time || !t.end_time) return false;
      const tStart = parseISO(`${t.start_date}T${t.start_time}`);
      const tEnd = parseISO(`${t.end_date}T${t.end_time}`);
      return overlaps(cursor, slotEnd, tStart, tEnd);
    });

    // Créneau bloqué ?
    const inBlocked = blockedSlots.some((b) =>
      overlaps(cursor, slotEnd, parseISO(b.start_at), parseISO(b.end_at))
    );

    // Conflit avec une autre résa ?
    const inBooking = existingBookings.some((b) =>
      overlaps(cursor, slotEnd, parseISO(b.start_at), parseISO(b.end_at))
    );

    const available = !inBreak && !tooSoon && !inPartialTimeOff && !inBlocked && !inBooking;

    slots.push({ start: cursor, end: slotEnd, available });
    cursor = addMinutes(cursor, intervalMinutes);
  }

  return slots;
}

/**
 * Détecte si un nouveau RDV chevauche un existant.
 */
export function hasConflict(
  newStart: Date,
  newEnd: Date,
  existingBookings: ExistingBooking[],
  excludeId?: string
): boolean {
  return existingBookings.some((b) => {
    if (excludeId && (b as ExistingBooking & { id?: string }).id === excludeId)
      return false;
    return overlaps(newStart, newEnd, parseISO(b.start_at), parseISO(b.end_at));
  });
}

/**
 * Convertit une heure HH:MM en minutes depuis minuit.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format Date → "HH:mm"
 */
export function dateToTimeString(date: Date): string {
  return format(date, 'HH:mm');
}