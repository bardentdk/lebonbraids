'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';

export function CTASection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="duotone-blue relative overflow-hidden rounded-3xl px-8 py-16 sm:px-16 sm:py-24">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--color-primary-700)) 0%, hsl(var(--color-primary-900)) 50%, hsl(var(--color-primary-950)) 100%)',
              }}
            />

            {/* Glows animés */}
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, hsl(var(--color-primary-400)) 0%, transparent 70%)',
                  animation: 'float 8s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, hsl(var(--color-secondary-500)) 0%, transparent 70%)',
                  animation: 'float 10s ease-in-out infinite reverse',
                }}
              />
            </div>

            {/* Pattern dots */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative text-center text-white">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Prête à transformer
                <br />
                <span className="text-gradient-premium">votre coiffure</span> ?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base text-white/80 sm:text-lg">
                Réservez votre rendez-vous en moins de 2 minutes et offrez-vous une expérience inoubliable.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MagneticButton strength={20}>
                  <Link
                    href="/reservation"
                    className="btn-shine group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-primary-700 shadow-premium transition-all hover:scale-105"
                  >
                    <Calendar className="h-5 w-5" />
                    Réserver maintenant
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-8 py-4 text-base font-medium text-white backdrop-blur-md transition-colors hover:border-white/60 hover:bg-white/10"
                >
                  Une question ?
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}