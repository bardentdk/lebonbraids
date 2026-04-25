import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { PlanningCalendar } from '@/components/admin/bookings/PlanningCalendar';
import { listBookings } from '@/lib/actions/bookings';
import { listServices } from '@/lib/actions/services';

export const metadata: Metadata = {
  title: 'Planning',
};

export default async function PlanningPage() {
  // Charge tous les bookings du mois courant +/- 1
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const [bookings, services] = await Promise.all([
    listBookings({ from: start.toISOString(), to: end.toISOString() }),
    listServices({ isActive: true }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning"
        description="Visualise et gère ton agenda en un coup d'œil"
      />
      <PlanningCalendar
        initialBookings={(bookings || []) as Parameters<typeof PlanningCalendar>[0]['initialBookings']}
        services={(services || []).map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          duration_minutes: s.duration_minutes,
        }))}
      />
    </div>
  );
}