'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingForm } from '@/components/admin/bookings/BookingForm';
import { createBooking } from '@/lib/actions/bookings';
import type { BookingInput } from '@/lib/validators/booking';

interface Props {
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  }>;
}

export function NewBookingClient({ services }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: BookingInput) => {
    startTransition(async () => {
      const res = await createBooking(data);
      if (!res.success) {
        toast.error(res.error || 'Erreur');
        return;
      }
      toast.success('Réservation créée ✨');
      router.push(`/admin/reservations/${res.id}`);
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="p-6">
          <BookingForm
            services={services}
            onSubmit={handleSubmit}
            formId="new-booking"
          />
        </CardContent>
      </Card>

      <div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
        <Button
          type="submit"
          form="new-booking"
          size="lg"
          fullWidth
          loading={isPending}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Créer la réservation
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}