import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Home,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice, formatDuration } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Confirmation de réservation',
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  const supabase = createAdminClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select(
      '*, services:booking_services(service_name, service_price, service_duration_minutes)'
    )
    .eq('reference', reference)
    .single();

  if (!booking) notFound();

  return (
    <div className="relative">
      <section className="relative overflow-hidden py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              'radial-gradient(circle at top, hsl(var(--color-primary-100)) 0%, transparent 50%)',
          }}
        />

        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Animation de succès */}
          <div className="text-center">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary shadow-premium">
              <CheckCircle2 className="h-12 w-12 text-white" />
              <div
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-primary-500/30"
              />
            </div>

            <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-5xl">
              Merci, <span className="text-gradient">{booking.client_first_name}</span> !
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Ta réservation est bien enregistrée. Tu vas recevoir un email de
              confirmation à <strong>{booking.client_email}</strong>.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-mono font-semibold text-primary-700">
              {booking.reference}
            </div>
          </div>

          {/* Détails */}
          <div className="mt-12 space-y-3">
            <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-soft">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                    Ton rendez-vous
                  </div>
                  <div className="mt-1 text-lg font-semibold capitalize">
                    {format(new Date(booking.start_at), 'EEEE d MMMM yyyy', {
                      locale: fr,
                    })}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(booking.start_at), 'HH:mm')}
                    </span>
                    <span>·</span>
                    <span>Durée : {formatDuration(booking.duration_minutes)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prestations
              </div>
              <ul className="mt-3 space-y-2">
                {((booking as { services: Array<{ service_name: string; service_price: number }> }).services || []).map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.service_name}</span>
                    <span className="font-semibold tabular-nums">
                      {formatPrice(Number(s.service_price))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-2xl font-bold tabular-nums text-primary-700">
                  {formatPrice(Number(booking.total_amount))}
                </span>
              </div>
              {Number(booking.deposit_required) > 0 && (
                <div className="mt-2 rounded-lg bg-warning/10 p-2 text-xs text-warning">
                  ⚠️ Acompte de{' '}
                  <strong>{formatPrice(Number(booking.deposit_required))}</strong>{' '}
                  à régler pour valider la réservation.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Une question ?
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row">
                <a
                  href="mailto:contact@example.com"
                  className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Nous écrire
                </a>
                <a
                  href="tel:+262000000000"
                  className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Nous appeler
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Home className="h-4 w-4" />}
              >
                Retour à l'accueil
              </Button>
            </Link>
            <Link href="/prestations">
              <Button
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Voir d'autres prestations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}