'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const labels: Record<string, string> = {
  admin: 'Dashboard',
  planning: 'Planning',
  reservations: 'Réservations',
  clients: 'Clients',
  prestations: 'Prestations',
  produits: 'Produits',
  stocks: 'Stocks',
  commandes: 'Commandes',
  paiements: 'Paiements',
  factures: 'Factures',
  statistiques: 'Statistiques',
  emails: 'Emails',
  parametres: 'Paramètres',
  theme: 'Thème',
  horaires: 'Horaires',
  entreprise: 'Entreprise',
  nouveau: 'Nouveau',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary-600"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {segments.slice(1).map((seg, i, arr) => {
        const href = '/' + segments.slice(0, i + 2).join('/');
        const isLast = i === arr.length - 1;
        const label = labels[seg] || seg;

        return (
          <div key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className={cn('font-medium text-foreground')}>
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground transition-colors hover:text-primary-600"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}