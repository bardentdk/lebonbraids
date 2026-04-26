'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Sparkles, Star } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils/format';

interface Service {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  duration_minutes: number;
  cover_image_url: string | null;
  is_featured: boolean;
  category?: { name: string; slug: string } | null;
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/prestations/${service.slug}`}
      data-reveal-item
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-premium"
    >
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

        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-1.5">
          {service.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white shadow-soft">
              <Star className="h-2.5 w-2.5 fill-white" />
              Populaire
            </span>
          )}
          {service.category && (
            <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary-700 backdrop-blur-md">
              {service.category.name}
            </span>
          )}
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold tabular-nums text-primary-700 shadow-soft backdrop-blur-md">
          {formatPrice(Number(service.price))}
        </div>
      </div>

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
  );
}