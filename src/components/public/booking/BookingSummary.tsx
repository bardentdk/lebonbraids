'use client';

import { Clock, Calendar, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice, formatDuration } from '@/lib/utils/format';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Props {
  selectedServices: Service[];
  selectedDate?: Date | null;
  selectedSlot?: Date | null;
}

export function BookingSummary({
  selectedServices,
  selectedDate,
  selectedSlot,
}: Props) {
  const subtotal = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-background p-6 shadow-soft lg:p-7">
      <h3 className="text-base font-semibold">Récapitulatif</h3>

      {selectedServices.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-muted/40 p-6 text-center">
          <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Sélectionne tes prestations
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-4 space-y-2">
            {selectedServices.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(s.duration_minutes)}
                  </div>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatPrice(Number(s.price))}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium tabular-nums">
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>

          {selectedSlot && (
            <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-700">
                <Calendar className="h-3.5 w-3.5" />
                Créneau
              </div>
              <div className="mt-1 text-sm font-medium capitalize">
                {format(selectedSlot, 'EEEE d MMMM', { locale: fr })}
              </div>
              <div className="text-xs text-muted-foreground">
                à {format(selectedSlot, 'HH:mm', { locale: fr })}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-2xl font-bold tabular-nums text-primary-700">
              {formatPrice(subtotal)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}