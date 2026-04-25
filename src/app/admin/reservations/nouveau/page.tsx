import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { listServices } from '@/lib/actions/services';
import { NewBookingClient } from './client';

export const metadata: Metadata = {
  title: 'Nouvelle réservation',
};

export default async function NewBookingPage() {
  const services = await listServices({ isActive: true });

  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Nouvelle réservation"
          backHref="/admin/reservations"
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Aucune prestation active disponible. Crée d'abord des prestations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle réservation"
        description="Crée un rendez-vous manuellement"
        backHref="/admin/reservations"
      />
      <NewBookingClient
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          duration_minutes: s.duration_minutes,
        }))}
      />
    </div>
  );
}