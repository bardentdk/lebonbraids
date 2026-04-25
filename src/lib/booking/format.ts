import { format, isSameDay, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: fr });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM', { locale: fr });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE d MMMM yyyy', { locale: fr });
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  return format(d, 'EEEE d MMMM', { locale: fr });
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function isSameDate(d1: Date | string, d2: Date | string): boolean {
  const a = typeof d1 === 'string' ? parseISO(d1) : d1;
  const b = typeof d2 === 'string' ? parseISO(d2) : d2;
  return isSameDay(a, b);
}