import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-premium">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-gradient text-5xl font-bold tracking-tight sm:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {siteConfig.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/admin">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Accéder à l'admin
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Connexion
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary-400 shadow-premium" />
          <div className="h-12 w-12 rounded-lg bg-primary-500 shadow-premium" />
          <div className="h-12 w-12 rounded-lg bg-primary-600 shadow-premium" />
          <div className="h-12 w-12 rounded-lg bg-primary-700 shadow-premium" />
          <div className="h-12 w-12 rounded-lg bg-primary-800 shadow-premium" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Page d'accueil temporaire — le site vitrine arrive à l'étape suivante.
        </p>
      </div>
    </main>
  );
}