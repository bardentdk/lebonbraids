'use client';

import { useEffect, useRef } from 'react';
import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/booking/format';
import { BOOKING_STATUS_CONFIG, type BookingStatus } from '../BookingStatusBadge';

interface Booking {
  id: string;
  client_first_name: string;
  client_last_name: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  services?: Array<{ service_name: string }>;
}

interface MonthViewProps {
  date: Date;
  bookings: Booking[];
  onBookingClick: (id: string) => void;
  onDayClick: (day: Date) => void;
}

export function MonthView({ date, bookings, onBookingClick, onDayClick }: MonthViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const cells = Array.from({ length: 42 }, (_, i) => addDays(calStart, i));
  const today = new Date();
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-day-cell]',
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.008,
          ease: 'power3.out',
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [date.toISOString()]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border bg-background"
    >
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map((d) => (
          <div
            key={d}
            className="border-r border-border px-3 py-2 text-center text-[11px] font-medium uppercase text-muted-foreground last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day) => {
          const inMonth = isSameMonth(day, date);
          const isToday = isSameDay(day, today);
          const dayBookings = bookings
            .filter((b) => isSameDay(parseISO(b.start_at), day))
            .sort(
              (a, b) =>
                parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime()
            );
          const visible = dayBookings.slice(0, 3);
          const more = dayBookings.length - visible.length;

          return (
            <button
              key={day.toISOString()}
              type="button"
              data-day-cell
              onClick={() => onDayClick(day)}
              className={cn(
                'group relative flex min-h-[110px] flex-col gap-1 border-b border-r border-border p-2 text-left transition-colors last:border-r-0 hover:bg-muted/40',
                !inMonth && 'bg-muted/10 opacity-50',
                isToday && 'bg-primary-50/40'
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                  isToday
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : inMonth
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </div>

              <div className="flex flex-col gap-0.5">
                {visible.map((b) => {
                  const conf = BOOKING_STATUS_CONFIG[b.status];
                  return (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(b.id);
                      }}
                      className={cn(
                        'group/booking flex items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all hover:scale-[1.02]',
                        conf.className
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', conf.dotClass)} />
                      <span className="tabular-nums opacity-80">
                        {formatTime(b.start_at)}
                      </span>
                      <span className="truncate">
                        {b.client_first_name} {b.client_last_name[0]}.
                      </span>
                    </div>
                  );
                })}
                {more > 0 && (
                  <div className="px-1.5 text-[10px] font-medium text-muted-foreground">
                    +{more} autre{more > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}