import type { Metadata } from 'next';
import { Heart, Sparkles, Star, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos',
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            <Heart className="h-3 w-3 fill-current" /> Notre histoire
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            La passion des <span className="text-gradient">tresses</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Une indépendante passionnée par l'art capillaire afro, qui met tout
            son cœur dans chaque création. Box braids, knotless, twists,
            chaque coiffure est unique et pensée pour vous.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat icon={Users} value="500+" label="Clientes satisfaites" />
            <Stat icon={Sparkles} value="50+" label="Styles différents" />
            <Stat icon={Star} value="4,9" label="Note moyenne" />
            <Stat icon={Heart} value="3 ans" label="D'expertise" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Heart; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-3xl font-bold tabular-nums text-gradient">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}