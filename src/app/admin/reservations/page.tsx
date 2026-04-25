import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { BookingsTable } from '@/components/admin/bookings/BookingsTable';
import { listBookings } from '@/lib/actions/bookings';

export const metadata: Metadata = {
  title: 'Réservations',
};

export default async function BookingsPage() {
  const bookings = await listBookings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réservations"
        description="Toutes les réservations clientes"
        actions={
          <>
            <Link href="/admin/planning">
              <Button variant="outline" leftIcon={<CalendarDays className="h-4 w-4" />}>
                Voir le planning
              </Button>
            </Link>
            <Link href="/admin/reservations/nouveau">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Nouvelle réservation
              </Button>
            </Link>
          </>
        }
      />
      <BookingsTable bookings={(bookings || []) as Parameters<typeof BookingsTable>[0]['bookings']} />
    </div>
  );
}