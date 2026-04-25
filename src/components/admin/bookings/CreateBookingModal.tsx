'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BookingForm } from './BookingForm';
import { createBooking } from '@/lib/actions/bookings';
import type { BookingInput } from '@/lib/validators/booking';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  services: Service[];
  defaultStartAt: Date | null;
  onCreated: () => void;
}

export function CreateBookingModal({
  open,
  onClose,
  services,
  defaultStartAt,
  onCreated,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: BookingInput) => {
    startTransition(async () => {
      const res = await createBooking(data);
      if (!res.success) {
        toast.error(res.error || 'Erreur');
        return;
      }
      toast.success('Réservation créée ✨');
      onCreated();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle réservation"
      description="Créer un rendez-vous manuellement"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="create-booking-form"
            loading={isPending}
          >
            Créer le RDV
          </Button>
        </>
      }
    >
      {open && (
        <BookingForm
          services={services}
          defaultStartAt={defaultStartAt}
          onSubmit={handleSubmit}
          formId="create-booking-form"
        />
      )}
    </Modal>
  );
}