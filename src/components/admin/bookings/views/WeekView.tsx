'use client';

import { useEffect, useRef } from 'react';
import {
  addDays,
  addMinutes,
  format,
  isSameDay,
  parseISO,
  set,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils/cn';
import { BookingCard } from '../BookingCard';
import type { BookingStatus } from '../BookingStatusBadge';

const HOUR_HEIGHT = 56;
const START_HOUR = 7;
const END_HOUR = 21;

interface Booking {
  id: string;
  client_first_name: string;
  client_last_name: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  services?: Array<{ service_name: string }>;
}

interface WeekViewProps {
  date: Date;
  bookings: Booking[];
  onBookingClick: (id: string) => void;
  onSlotClick: (start: Date) => void;
}

function dateToY(date: Date, refDay: Date): number {
  const dayStart = set(refDay, {
    hours: START_HOUR,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const diffMin = (date.getTime() - dayStart.getTime()) / 60000;
  return (diffMin / 60) * HOUR_HEIGHT;
}

export function WeekView({
  date,
  bookings,
  onBookingClick,
  onSlotClick,
}: WeekViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
  const today = new Date();

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-day-col]',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out' }
      );
      gsap.fromTo(
        '[data-booking]',
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.02, ease: 'power3.out', delay: 0.1 }
      );
    }, ref);
    return () => ctx.revert();
  }, [bookings.length, date.toISOString()]);

  const handleColClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = Math.round((y / HOUR_HEIGHT) * 60 / 30) * 30;
    const slotStart = addMinutes(
      set(day, { hours: START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 }),
      minutesFromStart
    );
    onSlotClick(slotStart);
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border bg-background"
    >
      {/* Header jours */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-muted/30">
        <div className="border-r border-border" />
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-r border-border px-2 py-3 text-center last:border-r-0',
                isToday && 'bg-primary-50/60'
              )}
            >
              <div className="text-[11px] font-medium uppercase text-muted-foreground">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div
                className={cn(
                  'mt-0.5 text-lg font-semibold',
                  isToday && 'text-primary-700'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)]">
        {/* Heures */}
        <div className="border-r border-border bg-muted/30">
          {hours.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="relative -mt-2.5 pr-2 text-right text-[11px] font-medium text-muted-foreground"
            >
              <span className="absolute right-2 top-0">{`${h}:00`}</span>
            </div>
          ))}
        </div>

        {/* Colonnes jours */}
        {days.map((day) => {
          const dayBookings = bookings.filter((b) => isSameDay(parseISO(b.start_at), day));
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              data-day-col
              onClick={(e) => handleColClick(day, e)}
              className={cn(
                'relative cursor-pointer border-r border-border last:border-r-0',
                isToday && 'bg-primary-50/20'
              )}
              style={{ height: HOUR_HEIGHT * (END_HOUR - START_HOUR) }}
            >
              {/* Lignes */}
              {hours.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'absolute left-0 right-0 border-t',
                    i === 0 ? 'border-transparent' : 'border-border'
                  )}
                  style={{ top: i * HOUR_HEIGHT }}
                />
              ))}
              {hours.map((_, i) => (
                <div
                  key={`half-${i}`}
                  className="absolute left-0 right-0 border-t border-dashed border-border/40"
                  style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                />
              ))}

              {/* Bookings */}
              {dayBookings.map((b) => {
                const top = dateToY(parseISO(b.start_at), day);
                const bottom = dateToY(parseISO(b.end_at), day);
                const height = Math.max(bottom - top, 32);

                return (
                  <div
                    key={b.id}
                    data-booking
                    style={{
                      top,
                      height,
                      position: 'absolute',
                      left: 4,
                      right: 4,
                    }}
                  >
                    <BookingCard
                      booking={b}
                      variant="absolute"
                      style={{ position: 'relative', top: 0, height: '100%', left: 0, right: 0 }}
                      onClick={() => {
                        // Stop propagation manually
                        onBookingClick(b.id);
                      }}
                    />
                  </div>
                );
              })}

              {/* Ligne "maintenant" */}
              {isToday && (() => {
                const now = new Date();
                const top = dateToY(now, day);
                if (top >= 0 && top <= HOUR_HEIGHT * (END_HOUR - START_HOUR)) {
                  return (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
                      style={{ top }}
                    >
                      <div className="-ml-1.5 h-2 w-2 rounded-full bg-danger shadow-glow" />
                      <div className="h-px flex-1 bg-danger" />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}