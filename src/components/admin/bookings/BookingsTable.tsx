'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Calendar } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice } from '@/lib/utils/format';
import { formatDateRelative, formatTime } from '@/lib/booking/format';
import { BookingStatusBadge, type BookingStatus } from './BookingStatusBadge';

interface Booking {
  id: string;
  reference: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  start_at: string;
  end_at: string;
  total_amount: number;
  status: BookingStatus;
  payment_status: string;
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (status && b.status !== status) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          b.client_first_name.toLowerCase().includes(q) ||
          b.client_last_name.toLowerCase().includes(q) ||
          b.client_email.toLowerCase().includes(q) ||
          b.reference.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, debouncedSearch, status]);

  const columns: Column<Booking>[] = [
    {
      key: 'client',
      label: 'Cliente',
      render: (b) => (
        <div>
          <div className="font-medium">
            {b.client_first_name} {b.client_last_name}
          </div>
          <div className="text-xs text-muted-foreground">{b.client_email}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (b) => (
        <div>
          <div className="capitalize">{formatDateRelative(b.start_at)}</div>
          <div className="text-xs text-muted-foreground">{formatTime(b.start_at)}</div>
        </div>
      ),
    },
    {
      key: 'reference',
      label: 'Référence',
      render: (b) => (
        <span className="font-mono text-xs text-muted-foreground">
          {b.reference}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (b) => (
        <span className="font-semibold tabular-nums">
          {formatPrice(Number(b.total_amount))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      align: 'center',
      render: (b) => <BookingStatusBadge status={b.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher (nom, email, référence)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'Tous statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'confirmed', label: 'Confirmé' },
              { value: 'in_progress', label: 'En cours' },
              { value: 'completed', label: 'Terminé' },
              { value: 'cancelled', label: 'Annulé' },
              { value: 'no_show', label: 'Absent' },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(b) => b.id}
        onRowClick={(b) => router.push(`/admin/reservations/${b.id}`)}
        emptyState={
          <EmptyState
            icon={<Calendar className="h-6 w-6" />}
            title={
              bookings.length === 0
                ? 'Aucune réservation'
                : 'Aucun résultat'
            }
            description={
              bookings.length === 0
                ? 'Les nouvelles réservations apparaîtront ici.'
                : 'Modifie tes filtres de recherche.'
            }
          />
        }
      />
    </div>
  );
}