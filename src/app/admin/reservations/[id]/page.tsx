import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/admin/shared/PageHeader';
import { getBooking } from '@/lib/actions/bookings';
import { listServices } from '@/lib/actions/services';
import { EditBookingClient } from './client';

export const metadata: Metadata = {
  title: 'Modifier la réservation',
};

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [booking, services] = await Promise.all([
      getBooking(id),
      listServices({ isActive: true }),
    ]);

    if (!booking) notFound();

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Réservation ${booking.reference}`}
          description={`${booking.client_first_name} ${booking.client_last_name}`}
          backHref="/admin/reservations"
        />
        <EditBookingClient
          bookingId={booking.id}
          initialData={{
            id: booking.id,
            client_id: booking.client_id,
            client_first_name: booking.client_first_name,
            client_last_name: booking.client_last_name,
            client_email: booking.client_email,
            client_phone: booking.client_phone,
            start_at: booking.start_at,
            end_at: booking.end_at,
            service_ids: ((booking as { services?: Array<{ service_id: string | null }> }).services || [])
              .map((s) => s.service_id)
              .filter((x): x is string => Boolean(x)),
            status: booking.status,
            payment_status: booking.payment_status,
            discount_amount: Number(booking.discount_amount || 0),
            deposit_required: Number(booking.deposit_required ?? 0),
            deposit_paid: Number(booking.deposit_paid || 0),
            notes: booking.notes || '',
            internal_notes: booking.internal_notes || '',
          }}
          services={(services || []).map((s) => ({
            id: s.id,
            name: s.name,
            price: Number(s.price),
            duration_minutes: s.duration_minutes,
          }))}
        />
      </div>
    );
  } catch {
    notFound();
  }
}