'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Ban,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { CreateBookingModal } from './CreateBookingModal';
import { BookingDetailDrawer } from './BookingDetailDrawer';
import { BlockedSlotModal } from './BlockedSlotModal';
import type { BookingStatus } from './BookingStatusBadge';

type ViewMode = 'day' | 'week' | 'month';

interface Booking {
  id: string;
  client_first_name: string;
  client_last_name: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  services?: Array<{ service_name: string }>;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface PlanningCalendarProps {
  initialBookings: Booking[];
  services: Service[];
}

export function PlanningCalendar({
  initialBookings,
  services,
}: PlanningCalendarProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [view, setView] = useState<ViewMode>('week');
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);

  const handlePrev = () => {
    if (view === 'day') setDate(addDays(date, -1));
    if (view === 'week') setDate(addWeeks(date, -1));
    if (view === 'month') setDate(addMonths(date, -1));
  };
  const handleNext = () => {
    if (view === 'day') setDate(addDays(date, 1));
    if (view === 'week') setDate(addWeeks(date, 1));
    if (view === 'month') setDate(addMonths(date, 1));
  };
  const handleToday = () => setDate(new Date());

  const handleSlotClick = (slot: Date) => {
    setSelectedSlot(slot);
    setCreateOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setDate(day);
    setView('day');
  };

  const handleBookingCreated = () => {
    setCreateOpen(false);
    setSelectedSlot(null);
    startTransition(() => router.refresh());
  };

  const handleBookingUpdated = () => {
    setDetailId(null);
    startTransition(() => router.refresh());
  };

  const periodLabel = () => {
    if (view === 'day') return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    if (view === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(startOfMonth(date), 'MMMM yyyy', { locale: fr });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Aujourd'hui
            </button>
            <div className="flex">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-9 w-9 items-center justify-center rounded-l-xl border border-r-0 border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-9 w-9 items-center justify-center rounded-r-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-lg font-semibold capitalize">{periodLabel()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-background p-0.5">
              {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    view === v
                      ? 'bg-gradient-primary text-white shadow-soft'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {v === 'day' && 'Jour'}
                  {v === 'week' && 'Semaine'}
                  {v === 'month' && 'Mois'}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Ban className="h-4 w-4" />}
              onClick={() => setBlockOpen(true)}
            >
              Bloquer
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setSelectedSlot(null);
                setCreateOpen(true);
              }}
            >
              Nouveau RDV
            </Button>
          </div>
        </div>

        {/* Vue */}
        <div>
          {view === 'day' && (
            <DayView
              date={date}
              bookings={initialBookings}
              onBookingClick={setDetailId}
              onSlotClick={handleSlotClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              date={date}
              bookings={initialBookings}
              onBookingClick={setDetailId}
              onSlotClick={handleSlotClick}
            />
          )}
          {view === 'month' && (
            <MonthView
              date={date}
              bookings={initialBookings}
              onBookingClick={setDetailId}
              onDayClick={handleDayClick}
            />
          )}
        </div>

        {/* Légende */}
        <div className="flex flex-wrap items-center gap-3 px-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning" /> En attente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-500" /> Confirmé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> En cours
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" /> Terminé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> Annulé
          </span>
        </div>
      </div>

      <CreateBookingModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setSelectedSlot(null);
        }}
        services={services}
        defaultStartAt={selectedSlot}
        onCreated={handleBookingCreated}
      />

      <BookingDetailDrawer
        bookingId={detailId}
        onClose={() => setDetailId(null)}
        onUpdated={handleBookingUpdated}
      />

      <BlockedSlotModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        onCreated={() => {
          setBlockOpen(false);
          startTransition(() => router.refresh());
        }}
      />
    </>
  );
}