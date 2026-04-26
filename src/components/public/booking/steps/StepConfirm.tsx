'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils/format';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface Props {
  services: Service[];
  selectedSlot: Date;
  info: ContactInfo;
}

export function StepConfirm({ services, selectedSlot, info }: Props) {
  const subtotal = services.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = services.reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Vérifie ta réservation
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Tout est correct ? Clique sur «&nbsp;Confirmer&nbsp;» pour finaliser.
        </p>
      </div>

      <div className="space-y-4">
        {/* Date */}
        <div className="flex items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50/40 p-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-soft">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-700">
              Rendez-vous
            </div>
            <div className="mt-0.5 text-base font-semibold capitalize">
              {format(selectedSlot, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(selectedSlot, 'HH:mm', { locale: fr })}
              </span>
              <span>·</span>
              <span>Durée : {formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Prestations */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prestations
          </div>
          <ul className="mt-3 space-y-2">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(s.duration_minutes)}
                  </div>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatPrice(Number(s.price))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-2xl font-bold tabular-nums text-primary-700">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tes coordonnées
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-muted-foreground" />
              {info.firstName} {info.lastName}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {info.email}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {info.phone}
            </li>
            {info.notes && (
              <li className="flex items-start gap-2.5">
                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="whitespace-pre-line">{info.notes}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}