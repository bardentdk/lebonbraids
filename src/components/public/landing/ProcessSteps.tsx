'use client';

import { Calendar, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const STEPS = [
  {
    number: '01',
    icon: Sparkles,
    title: 'Choisissez votre style',
    description:
      'Parcourez le catalogue et trouvez la prestation qui vous correspond.',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Réservez en ligne',
    description:
      'Sélectionnez votre créneau parmi les disponibilités en temps réel.',
  },
  {
    number: '03',
    icon: Heart,
    title: 'Préparez-vous',
    description:
      "Recevez un rappel par email et profitez de l'attente.",
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Profitez du résultat',
    description:
      'Repartez sublimée avec un look qui vous ressemble.',
  },
];

export function ProcessSteps() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              <CheckCircle2 className="h-3 w-3" /> En 4 étapes
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Comment ça <span className="text-gradient">marche</span> ?
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Un processus simple pour une expérience parfaite.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-premium">
                  {/* Numéro fantôme */}
                  <span className="pointer-events-none absolute right-4 top-1 select-none text-7xl font-black text-primary-100 transition-colors group-hover:text-primary-200">
                    {step.number}
                  </span>

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-soft">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector line (desktop only) */}
                  {i < STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-primary-200 to-transparent lg:block"
                    />
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}