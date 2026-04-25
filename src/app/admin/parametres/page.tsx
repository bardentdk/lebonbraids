import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette, Clock, Building2, ChevronRight, ShoppingBag, Mail } from 'lucide-react';

import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { ShopToggle } from '@/components/admin/settings/ShopToggle';
import { getSetting } from '@/lib/settings/service';

export const metadata: Metadata = {
  title: 'Paramètres',
};

const sections = [
  {
    title: 'Thème & couleurs',
    description: "Personnalise l'apparence du site",
    href: '/admin/parametres/theme',
    icon: Palette,
  },
  {
    title: 'Horaires d\'ouverture',
    description: 'Définis tes jours et horaires de travail',
    href: '/admin/parametres/horaires',
    icon: Clock,
  },
  {
    title: 'Informations entreprise',
    description: 'Nom, adresse, SIRET, contact',
    href: '/admin/parametres/entreprise',
    icon: Building2,
  },
  {
    title: 'Templates emails',
    description: 'Personnalise les emails envoyés aux clientes',
    href: '/admin/emails',
    icon: Mail,
  },
];

export default async function SettingsPage() {
  const shopEnabled = (await getSetting<boolean>('shop.enabled')) ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configure ta plateforme à ton image"
      />

      {/* Toggle boutique en avant */}
      <ShopToggle initialEnabled={shopEnabled} />

      {/* Sections */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}