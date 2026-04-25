'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CheckCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { BookingStatusBadge, type BookingStatus } from './BookingStatusBadge';
import { DeleteDialog } from '@/components/admin/shared/DeleteDialog';
import { formatDateLong, formatTimeRange } from '@/lib/booking/format';
import { formatPrice, formatDuration } from '@/lib/utils/format';
import {
  deleteBooking,
  getBooking,
  updateBookingStatus,
} from '@/lib/actions/bookings';

interface Props {
  bookingId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface BookingDetail {
  id: string;
  reference: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  deposit_paid: number;
  status: BookingStatus;
  payment_status: string;
  notes: string | null;
  internal_notes: string | null;
  services?: Array<{
    id: string;
    service_name: string;
    service_price: number;
    service_duration_minutes: number;
    quantity: number;
  }>;
}

export function BookingDetailDrawer({ bookingId, onClose, onUpdated }: Props) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      return;
    }
    setLoading(true);
    getBooking(bookingId)
      .then((data) => setBooking(data as unknown as BookingDetail))
      .catch(() => toast.error('Impossible de charger la réservation'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleStatusChange = (status: BookingStatus) => {
    if (!booking) return;
    startTransition(async () => {
      const res = await updateBookingStatus(booking.id, status);
      if (res.success) {
        toast.success('Statut mis à jour');
        setBooking({ ...booking, status });
        onUpdated();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!booking) return;
    startTransition(async () => {
      const res = await deleteBooking(booking.id);
      if (res.success) {
        toast.success('Réservation supprimée');
        setDeleting(false);
        onUpdated();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <AnimatePresence>
      {bookingId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-primary-950/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-premium"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">Détails du RDV</h2>
                {booking?.reference && (
                  <p className="text-xs font-mono text-muted-foreground">
                    {booking.reference}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
              ) : booking ? (
                <div className="space-y-5 p-5">
                  <div>
                    <BookingStatusBadge status={booking.status} />
                    <h3 className="mt-3 text-xl font-bold">
                      {booking.client_first_name} {booking.client_last_name}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {formatDateLong(booking.start_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTimeRange(booking.start_at, booking.end_at)}</span>
                      <span className="text-muted-foreground">
                        ({formatDuration(booking.duration_minutes)})
                      </span>
                    </div>
                    <a
                      href={`mailto:${booking.client_email}`}
                      className="flex items-center gap-2.5 text-sm transition-colors hover:text-primary-600"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {booking.client_email}
                    </a>
                    <a
                      href={`tel:${booking.client_phone}`}
                      className="flex items-center gap-2.5 text-sm transition-colors hover:text-primary-600"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {booking.client_phone}
                    </a>
                  </div>

                  {/* Prestations */}
                  {booking.services && booking.services.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Prestations
                      </h4>
                      <div className="space-y-1.5">
                        {booking.services.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                          >
                            <span>{s.service_name}</span>
                            <span className="font-medium tabular-nums">
                              {formatPrice(Number(s.service_price))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tarif */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="tabular-nums">
                        {formatPrice(Number(booking.subtotal))}
                      </span>
                    </div>
                    {Number(booking.discount_amount) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Réduction</span>
                        <span className="tabular-nums text-success">
                          -{formatPrice(Number(booking.discount_amount))}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold tabular-nums">
                        {formatPrice(Number(booking.total_amount))}
                      </span>
                    </div>
                    {Number(booking.deposit_paid) > 0 && (
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Acompte versé</span>
                        <span className="tabular-nums">
                          {formatPrice(Number(booking.deposit_paid))}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {(booking.notes || booking.internal_notes) && (
                    <div className="space-y-3">
                      {booking.notes && (
                        <div>
                          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Notes cliente
                          </h4>
                          <p className="rounded-lg bg-muted/40 p-3 text-sm">
                            {booking.notes}
                          </p>
                        </div>
                      )}
                      {booking.internal_notes && (
                        <div>
                          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Notes internes
                          </h4>
                          <p className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm">
                            {booking.internal_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions de statut */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions rapides
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {booking.status !== 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('confirmed')}
                          disabled={isPending}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirmer
                        </button>
                      )}
                      {booking.status !== 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('in_progress')}
                          disabled={isPending}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-60"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          En cours
                        </button>
                      )}
                      {booking.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('completed')}
                          disabled={isPending}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-60"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Terminer
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('cancelled')}
                          disabled={isPending}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-60"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Annuler
                        </button>
                      )}
                      {booking.status !== 'no_show' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('no_show')}
                          disabled={isPending}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Absente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {booking && (
              <div className="border-t border-border bg-muted/30 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/reservations/${booking.id}`}>
                    <Button variant="outline" size="sm" fullWidth leftIcon={<Edit2 className="h-3.5 w-3.5" />}>
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setDeleting(true)}
                    className="!border-danger/30 !text-danger hover:!bg-danger/10"
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>

          <DeleteDialog
            open={deleting}
            onClose={() => setDeleting(false)}
            onConfirm={handleDelete}
            title="Supprimer cette réservation ?"
            description="Cette action est définitive. Pour conserver l'historique, préfère le statut 'Annulé'."
            loading={isPending}
          />
        </>
      )}
    </AnimatePresence>
  );
}