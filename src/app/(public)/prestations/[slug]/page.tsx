import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Sparkles, Check } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDuration } from '@/lib/utils/format';
import { MagneticButton } from '@/components/animations/MagneticButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('services')
    .select('name, meta_title, meta_description, short_description')
    .eq('slug', slug)
    .single();

  return {
    title: data?.meta_title || data?.name || 'Prestation',
    description: data?.meta_description || data?.short_description || '',
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from('services')
    .select('*, category:service_categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (!service) notFound();

  const { data: related } = await supabase
    .from('services')
    .select('id, slug, name, price, duration_minutes, cover_image_url')
    .eq('is_active', true)
    .is('deleted_at', null)
    .eq('category_id', service.category_id)
    .neq('id', service.id)
    .limit(3);

  return (
    <article>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/prestations"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux prestations
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-primary shadow-premium">
              {service.cover_image_url ? (
                <Image
                  src={service.cover_image_url}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/30">
                  <Sparkles className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex flex-col">
              {service.category && (
                <Link
                  href={`/prestations?category=${service.category.slug}`}
                  className="inline-flex w-fit rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-200"
                >
                  {service.category.name}
                </Link>
              )}

              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {service.name}
              </h1>

              {service.short_description && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {service.short_description}
                </p>
              )}

              {/* Prix + durée */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl bg-gradient-primary px-5 py-3 text-2xl font-bold text-white tabular-nums shadow-premium">
                  {formatPrice(Number(service.price))}
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                  <Clock className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium tabular-nums">
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>
              </div>

              {/* Acompte */}
              {Number(service.deposit_amount) > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm">
                  <Check className="h-4 w-4 text-primary-600" />
                  <span>
                    Acompte de{' '}
                    <strong>{formatPrice(Number(service.deposit_amount))}</strong>{' '}
                    à la réservation
                  </span>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8">
                <MagneticButton strength={15}>
                  <Link
                    href={`/reservation?service=${service.id}`}
                    className="btn-shine group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-7 py-4 text-base font-semibold text-white shadow-premium transition-all hover:shadow-glow sm:w-auto"
                  >
                    <Calendar className="h-5 w-5" />
                    Réserver cette prestation
                  </Link>
                </MagneticButton>
              </div>

              {/* Description complète */}
              {service.description && (
                <div className="mt-10 border-t border-border pt-8">
                  <h2 className="text-lg font-semibold">Description</h2>
                  <div className="prose prose-sm mt-3 max-w-none whitespace-pre-line text-muted-foreground">
                    {service.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Prestations associées */}
      {related && related.length > 0 && (
        <section className="mt-20 py-16 sm:mt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              D'autres prestations qui pourraient vous plaire
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/prestations/${r.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {r.cover_image_url ? (
                      <Image
                        src={r.cover_image_url}
                        alt={r.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/40">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold transition-colors group-hover:text-primary-700">
                      {r.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-bold tabular-nums text-foreground">
                        {formatPrice(Number(r.price))}
                      </span>
                      <span>·</span>
                      <span>{formatDuration(r.duration_minutes)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}