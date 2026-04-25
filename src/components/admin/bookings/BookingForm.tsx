'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addMinutes, parseISO } from 'date-fns';
import { Mail, Phone, User, Calendar, Clock } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDuration } from '@/lib/utils/format';
import { bookingSchema, type BookingInput } from '@/lib/validators/booking';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface BookingFormProps {
  services: Service[];
  initialData?: Partial<BookingInput>;
  defaultStartAt?: Date | null;
  onSubmit: (data: BookingInput) => void;
  formId?: string;
}

export function BookingForm({
  services,
  initialData,
  defaultStartAt,
  onSubmit,
  formId,
}: BookingFormProps) {
  const startAtInit = useMemo(() => {
    if (initialData?.start_at) return new Date(initialData.start_at);
    if (defaultStartAt) return defaultStartAt;
    const next = new Date();
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    return next;
  }, [initialData?.start_at, defaultStartAt]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      id: initialData?.id,
      client_id: initialData?.client_id || null,
      client_first_name: initialData?.client_first_name || '',
      client_last_name: initialData?.client_last_name || '',
      client_email: initialData?.client_email || '',
      client_phone: initialData?.client_phone || '',
      start_at: format(startAtInit, "yyyy-MM-dd'T'HH:mm"),
      end_at:
        initialData?.end_at
          ? format(parseISO(initialData.end_at), "yyyy-MM-dd'T'HH:mm")
          : format(addMinutes(startAtInit, 60), "yyyy-MM-dd'T'HH:mm"),
      service_ids: initialData?.service_ids || [],
      status: initialData?.status || 'confirmed',
      payment_status: initialData?.payment_status || 'unpaid',
      discount_amount: initialData?.discount_amount ?? 0,
      deposit_paid: initialData?.deposit_paid ?? 0,
      notes: initialData?.notes || '',
      internal_notes: initialData?.internal_notes || '',
    },
  });

  const selectedIds = watch('service_ids') || [];
  const startAt = watch('start_at');
  const discount = Number(watch('discount_amount') || 0);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedIds.includes(s.id)),
    [services, selectedIds]
  );

  const subtotal = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );
  const total = subtotal - discount;

  // Auto-calcul du end_at
  useEffect(() => {
    if (!startAt || totalDuration === 0) return;
    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) return;
    const end = addMinutes(start, totalDuration);
    setValue('end_at', format(end, "yyyy-MM-dd'T'HH:mm"));
  }, [startAt, totalDuration, setValue]);

  const toggleService = (id: string) => {
    const current = selectedIds;
    if (current.includes(id)) {
      setValue(
        'service_ids',
        current.filter((x) => x !== id),
        { shouldValidate: true }
      );
    } else {
      setValue('service_ids', [...current, id], { shouldValidate: true });
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Client */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <User className="h-4 w-4 text-primary-600" /> Cliente
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prénom"
            {...register('client_first_name')}
            error={errors.client_first_name?.message}
          />
          <Input
            label="Nom"
            {...register('client_last_name')}
            error={errors.client_last_name?.message}
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            {...register('client_email')}
            error={errors.client_email?.message}
          />
          <Input
            label="Téléphone"
            type="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            {...register('client_phone')}
            error={errors.client_phone?.message}
          />
        </div>
      </div>

      {/* Date & heure */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-primary-600" /> Créneau
        </h3>
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
            hint="Auto-calculé selon prestations"
            {...register('end_at')}
            error={errors.end_at?.message}
          />
        </div>
      </div>

      {/* Prestations */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary-600" /> Prestations
        </h3>
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Aucune prestation active. Crée d'abord des prestations dans le menu Prestations.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {services.map((s) => {
              const selected = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    selected
                      ? 'border-primary-500 bg-primary-50/40 ring-2 ring-primary-500/20'
                      : 'border-border hover:border-primary-300 hover:bg-muted/40'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-border bg-background'
                    }`}
                  >
                    {selected && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={4}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatPrice(s.price)}</span>
                      <span>·</span>
                      <span>{formatDuration(s.duration_minutes)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {errors.service_ids && (
          <p className="mt-1.5 text-xs text-danger">
            {errors.service_ids.message as string}
          </p>
        )}
      </div>

      {/* Total */}
      {selectedServices.length > 0 && (
        <Card className="border-primary-200 bg-primary-50/40">
          <CardContent className="space-y-2 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Réduction</span>
              <Input
                type="number"
                step="0.01"
                {...register('discount_amount')}
                className="!h-9 max-w-[100px] text-right"
              />
            </div>
            <div className="flex items-center justify-between border-t border-primary-200 pt-2">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold tabular-nums text-primary-700">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Durée totale</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statuts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label="Statut RDV"
              options={[
                { value: 'pending', label: 'En attente' },
                { value: 'confirmed', label: 'Confirmé' },
                { value: 'in_progress', label: 'En cours' },
                { value: 'completed', label: 'Terminé' },
                { value: 'cancelled', label: 'Annulé' },
                { value: 'no_show', label: 'Absent' },
              ]}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="payment_status"
          render={({ field }) => (
            <Select
              label="Statut paiement"
              options={[
                { value: 'unpaid', label: 'Non payé' },
                { value: 'deposit_paid', label: 'Acompte versé' },
                { value: 'paid', label: 'Payé' },
                { value: 'refunded', label: 'Remboursé' },
                { value: 'partial_refund', label: 'Remboursement partiel' },
              ]}
              {...field}
            />
          )}
        />
      </div>

      {/* Acompte */}
      <Input
        type="number"
        step="0.01"
        label="Acompte versé (€)"
        {...register('deposit_paid')}
      />

      {/* Notes */}
      <Textarea
        label="Notes cliente"
        rows={3}
        hint="Visible par la cliente"
        {...register('notes')}
      />
      <Textarea
        label="Notes internes"
        rows={3}
        hint="Privé — non visible par la cliente"
        {...register('internal_notes')}
      />
    </form>
  );
}