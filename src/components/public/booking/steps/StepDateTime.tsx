'use client';

import { useEffect, useState } from 'react';
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
  addWeeks,
  isBefore,
  startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  CalendarOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils/cn';

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

interface Props {
  totalDuration: number;
  selectedDate: Date | null;
  selectedSlot: Date | null;
  onSelectDate: (d: Date) => void;
  onSelectSlot: (s: Date) => void;
}

export function StepDateTime({
  totalDuration,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch slots
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/public/availability?date=${selectedDate.toISOString()}&duration=${totalDuration}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error('Erreur de chargement');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSlots(data.slots || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Erreur');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, totalDuration]);

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Choisis ta date et ton heure
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Les créneaux affichés correspondent à la durée totale de tes prestations.
        </p>
      </div>

      {/* Sélecteur semaine */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setWeekOffset((o) => Math.max(o - 1, 0))}
          disabled={weekOffset === 0}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold capitalize">
          {format(weekStart, 'd MMMM', { locale: fr })} —{' '}
          {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: fr })}
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Semaine suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days grid */}
      <div className="mb-8 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const isPast = isBefore(d, today);
          const isSelected = selectedDate && isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => !isPast && onSelectDate(d)}
              disabled={isPast}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all sm:p-3',
                isSelected &&
                  'border-primary-500 bg-gradient-primary text-white shadow-soft',
                !isSelected &&
                  !isPast &&
                  'border-border bg-background hover:border-primary-300',
                isPast && 'cursor-not-allowed border-transparent bg-muted/30 opacity-30'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase',
                  isSelected ? 'text-white/80' : 'text-muted-foreground'
                )}
              >
                {format(d, 'EEE', { locale: fr })}
              </span>
              <span className="text-base font-bold tabular-nums sm:text-xl">
                {format(d, 'd')}
              </span>
              {isToday && (
                <span
                  className={cn(
                    'h-1 w-1 rounded-full',
                    isSelected ? 'bg-white' : 'bg-primary-500'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <AnimatePresence mode="wait">
        {!selectedDate ? (
          <motion.div
            key="no-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-10 text-center"
          >
            <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Sélectionne une date pour voir les créneaux disponibles
            </p>
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center text-sm text-danger"
          >
            {error}
          </motion.div>
        ) : availableSlots.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-10 text-center"
          >
            <CalendarOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">Aucun créneau disponible ce jour</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Essaie un autre jour de la semaine.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {availableSlots.length} créneaux disponibles
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {availableSlots.map((slot, i) => {
                const slotStart = new Date(slot.start);
                const isSelected = selectedSlot && isSameDay(slotStart, selectedSlot) && slotStart.getTime() === selectedSlot.getTime();

                return (
                  <motion.button
                    key={slot.start}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => onSelectSlot(slotStart)}
                    className={cn(
                      'rounded-xl border-2 px-3 py-2.5 text-sm font-semibold tabular-nums transition-all',
                      isSelected
                        ? 'border-primary-500 bg-gradient-primary text-white shadow-soft'
                        : 'border-border bg-background hover:border-primary-300 hover:shadow-soft'
                    )}
                  >
                    {format(slotStart, 'HH:mm')}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}