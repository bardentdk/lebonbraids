import type { Metadata } from 'next';
import {
  DollarSign,
  CalendarDays,
  Users,
  ShoppingBag,
  AlertTriangle,
  Clock,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Dashboard',
};

async function getKpis() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_dashboard_kpis', {
    period_days: 30,
  });

  if (error) {
    console.error(error);
    return null;
  }
  return data as {
    revenue: number;
    revenue_previous: number;
    bookings_count: number;
    bookings_completed: number;
    orders_count: number;
    new_clients: number;
    upcoming_bookings: number;
    low_stock_products: number;
  };
}

export default async function AdminDashboardPage() {
  const kpis = await getKpis();

  const revenueTrend =
    kpis && kpis.revenue_previous > 0
      ? ((kpis.revenue - kpis.revenue_previous) / kpis.revenue_previous) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aperçu des 30 derniers jours
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Chiffre d'affaires"
          value={kpis?.revenue || 0}
          icon="DollarSign"
          format="currency"
          trend={revenueTrend}
          trendLabel="vs période précédente"
          color="primary"
          delay={0}
        />
        <StatsCard
          label="Réservations"
          value={kpis?.bookings_count || 0}
          icon="CalendarDays"
          trendLabel={`${kpis?.bookings_completed || 0} complétées`}
          color="success"
          delay={0.1}
        />
        <StatsCard
          label="Nouveaux clients"
          value={kpis?.new_clients || 0}
          icon="Users"
          color="warning"
          delay={0.2}
        />
        <StatsCard
          label="Commandes"
          value={kpis?.orders_count || 0}
          icon="ShoppingBag"
          color="primary"
          delay={0.3}
        />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
                <Clock className="h-4 w-4" />
              </div>
              <CardTitle>Prochains rendez-vous</CardTitle>
            </div>
            <CardDescription>
              {kpis?.upcoming_bookings || 0} rendez-vous à venir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Le module planning sera connecté à l'étape suivante.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <CardTitle>Alertes de stock</CardTitle>
            </div>
            <CardDescription>
              {kpis?.low_stock_products || 0} produits en stock bas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              La gestion des stocks sera disponible prochainement.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome bloc */}
      <Card className="overflow-hidden bg-gradient-primary text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Bienvenue dans ton back-office ✨</h3>
              <p className="mt-2 max-w-lg text-sm text-white/80">
                Ton tableau de bord est prêt ! Personnalise les couleurs du site
                depuis <strong>Thème</strong>, et configure ton entreprise pour
                accueillir tes clientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}