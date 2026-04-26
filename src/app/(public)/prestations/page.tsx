import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { ServicesGrid } from '@/components/public/services/ServicesGrid';
import { unwrapOne } from '@/lib/utils/supabase-types';

export const metadata: Metadata = {
  title: 'Prestations',
  description: 'Découvrez notre catalogue de tresses et coiffures afro.',
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const [{ data: rawServices }, { data: categories }] = await Promise.all([
    supabase
      .from('services')
      .select(
        'id, slug, name, short_description, price, duration_minutes, cover_image_url, is_featured, category_id, category:service_categories(name, slug)'
      )
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('sort_order'),
    supabase
      .from('service_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  // Normalisation : Supabase peut retourner category en array, on unwrap
  const services = (rawServices || []).map((s) => ({
    ...s,
    category: unwrapOne(s.category),
  }));

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-20">
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
              {services.length} prestations disponibles
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Notre <span className="text-gradient">catalogue</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Trouvez la prestation qui sublimera votre style.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServicesGrid services={services} categories={categories || []} />
        </div>
      </section>
    </div>
  );
}