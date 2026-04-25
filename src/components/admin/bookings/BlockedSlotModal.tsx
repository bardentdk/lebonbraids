'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  blockedSlotSchema,
  type BlockedSlotInput,
} from '@/lib/validators/booking';
import { createBlockedSlot } from '@/lib/actions/availability';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function BlockedSlotModal({ open, onClose, onCreated }: Props) {
  const [isPending, startTransition] = useTransition();

  const initStart = new Date();
  initStart.setMinutes(0, 0, 0);
  initStart.setHours(initStart.getHours() + 1);
  const initEnd = new Date(initStart);
  initEnd.setHours(initEnd.getHours() + 1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockedSlotInput>({
    resolver: zodResolver(blockedSlotSchema),
    defaultValues: {
      start_at: format(initStart, "yyyy-MM-dd'T'HH:mm"),
      end_at: format(initEnd, "yyyy-MM-dd'T'HH:mm"),
      reason: '',
    },
  });

  const onSubmit = (data: BlockedSlotInput) => {
    startTransition(async () => {
      const res = await createBlockedSlot(data);
      if (res.success) {
        toast.success('Créneau bloqué');
        reset();
        onCreated();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bloquer un créneau"
      description="Empêche toute réservation sur cette plage horaire"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
            Bloquer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            type="datetime-local"
            label="Début"
            {...register('start_at')}
            error={errors.start_at?.message}
          />
          <Input
            type="datetime-local"
            label="Fin"
            {...register('end_at')}
            error={errors.end_at?.message}
          />
        </div>
        <Textarea
          label="Raison (optionnel)"
          rows={2}
          placeholder="Ex: Rendez-vous personnel, livraison..."
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}