'use client';

import { useEffect, useRef } from 'react';
import { addMinutes, set, startOfDay, endOfDay, parseISO } from 'date-fns';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils/cn';
import { BookingCard } from '../BookingCard';
import type { BookingStatus } from '../BookingStatusBadge';

const HOUR_HEIGHT = 64; // px par heure
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

interface DayViewProps {
  date: Date;
  bookings: Booking[];
  onBookingClick: (id: string) => void;
  onSlotClick: (start: Date) => void;
}

function dateToY(date: Date, refDay: Date): number {
  const dayStart = set(refDay, { hours: START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 });
  const diffMin = (date.getTime() - dayStart.getTime()) / 60000;
  return (diffMin / 60) * HOUR_HEIGHT;
}

export function DayView({ date, bookings, onBookingClick, onSlotClick }: DayViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-booking]',
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power3.out',
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [bookings.length, date.toISOString()]);

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = Math.round((y / HOUR_HEIGHT) * 60 / 30) * 30;
    const slotStart = addMinutes(
      set(date, { hours: START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 }),
      minutesFromStart
    );
    onSlotClick(slotStart);
  };

  // Tri pour les chevauchements
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const dayBookings = bookings.filter((b) => {
    const s = parseISO(b.start_at);
    return s >= dayStart && s <= dayEnd;
  });

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-border bg-background"
    >
      <div className="flex">
        {/* Colonne heures */}
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted/30">
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

        {/* Grid */}
        <div className="relative flex-1">
          <div
            onClick={handleBgClick}
            className="relative cursor-pointer"
            style={{ height: HOUR_HEIGHT * (END_HOUR - START_HOUR) }}
          >
            {/* Lignes des heures */}
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
            {/* Demi-heures */}
            {hours.map((_, i) => (
              <div
                key={`half-${i}`}
                className="absolute left-0 right-0 border-t border-dashed border-border/40"
                style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
              />
            ))}
          </div>

          {/* Bookings positionnés en absolu */}
          {dayBookings.map((b) => {
            const top = dateToY(parseISO(b.start_at), date);
            const bottom = dateToY(parseISO(b.end_at), date);
            const height = Math.max(bottom - top, 32);

            return (
              <div
                key={b.id}
                data-booking
                style={{
                  top,
                  height,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                }}
                className="px-1"
              >
                <BookingCard
                  booking={b}
                  variant="absolute"
                  style={{ position: 'relative', top: 0, height: '100%' }}
                  onClick={() => onBookingClick(b.id)}
                />
              </div>
            );
          })}

          {/* Ligne "maintenant" */}
          {(() => {
            const now = new Date();
            if (
              now.getFullYear() === date.getFullYear() &&
              now.getMonth() === date.getMonth() &&
              now.getDate() === date.getDate()
            ) {
              const top = dateToY(now, date);
              if (top >= 0 && top <= HOUR_HEIGHT * (END_HOUR - START_HOUR)) {
                return (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
                    style={{ top }}
                  >
                    <div className="-ml-1.5 h-3 w-3 rounded-full bg-danger shadow-glow" />
                    <div className="h-px flex-1 bg-danger" />
                  </div>
                );
              }
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}