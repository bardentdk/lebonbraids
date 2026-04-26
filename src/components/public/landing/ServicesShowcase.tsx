'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { formatPrice, formatDuration } from '@/lib/utils/format';

interface Service {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  duration_minutes: number;
  cover_image_url: string | null;
}

export function ServicesShowcase({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              <Sparkles className="h-3 w-3" /> Nos prestations
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              <span className="text-gradient">Sublimez</span> votre style
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Une sélection des prestations les plus demandées par nos clientes.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal stagger delay={0.2}>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, index) => (
              <Link
                key={service.id}
                href={`/prestations/${service.slug}`}
                data-reveal-item
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-premium"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-primary">
                  {service.cover_image_url ? (
                    <Image
                      src={service.cover_image_url}
                      alt={service.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/30">
                      <Sparkles className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

                  {/* Prix flottant */}
                  <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold tabular-nums text-primary-700 shadow-soft backdrop-blur-md">
                    {formatPrice(Number(service.price))}
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary-700">
                    {service.name}
                  </h3>
                  {service.short_description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {service.short_description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(service.duration_minutes)}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-transform group-hover:translate-x-1">
                      Découvrir
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 text-center">
            <Link
              href="/prestations"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Voir toutes les prestations
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}