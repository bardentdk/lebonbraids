import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { BookingFlow } from '@/components/public/booking/BookingFlow';
import { Card, CardContent } from '@/components/ui/Card';
import { unwrapOne } from '@/lib/utils/supabase-types';

export const metadata: Metadata = {
  title: 'Réservation',
};

export default async function ReservationPage() {
  const supabase = await createClient();
  const { data: rawServices } = await supabase
    .from('services')
    .select(
      'id, name, short_description, price, duration_minutes, cover_image_url, category:service_categories(name)'
    )
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .order('sort_order');

  const services = (rawServices || []).map((s) => ({
    ...s,
    category: unwrapOne(s.category),
  }));

  return (
    <div className="relative">
      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--color-primary-300)) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              <Sparkles className="h-3 w-3" />
              Réservation en ligne
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-gradient">Prends</span> ton rendez-vous
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              En 4 étapes simples, ton créneau est réservé.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {services.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <h2 className="text-lg font-semibold">
                  Aucune prestation disponible pour le moment
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reviens bientôt ou contacte-nous directement.
                </p>
              </CardContent>
            </Card>
          ) : (
            <BookingFlow services={services} />
          )}
        </div>
      </section>
    </div>
  );
}