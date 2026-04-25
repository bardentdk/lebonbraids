'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingForm } from '@/components/admin/bookings/BookingForm';
import { DeleteDialog } from '@/components/admin/shared/DeleteDialog';
import { updateBooking, deleteBooking } from '@/lib/actions/bookings';
import type { BookingInput } from '@/lib/validators/booking';

interface Props {
  bookingId: string;
  initialData: BookingInput;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  }>;
}

export function EditBookingClient({ bookingId, initialData, services }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = (data: BookingInput) => {
    startTransition(async () => {
      const res = await updateBooking({ ...data, id: bookingId });
      if (!res.success) {
        toast.error(res.error || 'Erreur');
        return;
      }
      toast.success('Réservation mise à jour');
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteBooking(bookingId);
      if (res.success) {
        toast.success('Réservation supprimée');
        router.push('/admin/reservations');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6">
            <BookingForm
              services={services}
              initialData={initialData}
              onSubmit={handleSubmit}
              formId="edit-booking"
            />
          </CardContent>
        </Card>

        <div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
          <Button
            type="submit"
            form="edit-booking"
            size="lg"
            fullWidth
            loading={isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Enregistrer
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => setDeleting(true)}
            className="!border-danger/30 !text-danger hover:!bg-danger/10"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <DeleteDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title="Supprimer définitivement ?"
        description="Cette action est irréversible. Préfère le statut 'Annulé' si tu veux conserver l'historique."
        loading={isPending}
      />
    </>
  );
}