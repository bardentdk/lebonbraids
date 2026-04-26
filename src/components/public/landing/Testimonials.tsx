'use client';

import { Star, Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const TESTIMONIALS = [
  {
    name: 'Aïcha M.',
    rating: 5,
    text: "Une vraie professionnelle ! Mes box braids tiennent depuis 8 semaines et sont toujours impeccables. Je recommande à 1000% ✨",
    service: 'Box Braids',
  },
  {
    name: 'Léa K.',
    rating: 5,
    text: "Première fois en knotless et je suis conquise. Travail soigné, ambiance détendue, et le résultat est juste parfait.",
    service: 'Knotless Mid-back',
  },
  {
    name: 'Sarah B.',
    rating: 5,
    text: "Toujours à l'écoute, prend le temps de comprendre ce qu'on veut. Un vrai talent et un super moment à chaque fois.",
    service: 'Twists Senegalese',
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-20 sm:py-28">
      {/* Décoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, hsl(var(--color-primary-200)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--color-secondary-50)) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              <Star className="h-3 w-3 fill-current" /> 4,9 / 5 sur 200+ avis
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Ce que disent <span className="text-gradient">nos clientes</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-premium">
                <Quote className="absolute right-4 top-4 h-12 w-12 text-primary-100 transition-colors group-hover:text-primary-200" />
                <div className="relative">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star
                        key={k}
                        className="h-4 w-4 fill-secondary-500 text-secondary-500"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">«&nbsp;{t.text}&nbsp;»</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.service}</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
                      {t.name[0]}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}