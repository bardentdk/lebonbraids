'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
  Sparkles,
  Plus,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { DeleteDialog } from '@/components/admin/shared/DeleteDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice, formatDuration } from '@/lib/utils/format';
import { deleteService, toggleServiceActive } from '@/lib/actions/services';

interface Service {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  category?: { id: string; name: string; slug: string } | null;
  short_description: string | null;
  price: number;
  duration_minutes: number;
  cover_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  total_bookings: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface ServicesTableProps {
  services: Service[];
  categories: Category[];
}

export function ServicesTable({ services, categories }: ServicesTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (
        debouncedSearch &&
        !s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter && s.category_id !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'active' && !s.is_active) return false;
      if (statusFilter === 'inactive' && s.is_active) return false;
      return true;
    });
  }, [services, debouncedSearch, categoryFilter, statusFilter]);

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleServiceActive(id, !current);
      if (res.success) {
        toast.success(current ? 'Prestation désactivée' : 'Prestation activée');
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteService(deletingId);
      if (res.success) {
        toast.success('Prestation archivée');
        setDeletingId(null);
      } else {
        toast.error(res.error);
      }
    });
  };

  const columns: Column<Service>[] = [
    {
      key: 'image',
      label: '',
      width: '64px',
      render: (s) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
          {s.cover_image_url ? (
            <Image
              src={s.cover_image_url}
              alt={s.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nom',
      render: (s) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{s.name}</span>
            {s.is_featured && (
              <Star
                className="h-3.5 w-3.5 fill-secondary-500 text-secondary-500"
                aria-label="Mise en avant"
              />
            )}
          </div>
          {s.category && (
            <span className="mt-0.5 text-xs text-muted-foreground">
              {s.category.name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      align: 'right',
      render: (s) => (
        <span className="font-semibold tabular-nums">{formatPrice(s.price)}</span>
      ),
    },
    {
      key: 'duration',
      label: 'Durée',
      align: 'right',
      render: (s) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDuration(s.duration_minutes)}
        </span>
      ),
    },
    {
      key: 'bookings',
      label: 'Réservations',
      align: 'right',
      render: (s) => (
        <span className="tabular-nums text-muted-foreground">
          {s.total_bookings}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      align: 'center',
      render: (s) => (
        <Badge variant={s.is_active ? 'success' : 'default'}>
          {s.is_active ? 'Actif' : 'Désactivé'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      align: 'right',
      render: (s) => (
        <Dropdown
          trigger={
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          }
          items={[
            {
              label: 'Modifier',
              icon: <Edit2 className="h-4 w-4" />,
              onClick: () => (window.location.href = `/admin/prestations/${s.id}`),
            },
            {
              label: s.is_active ? 'Désactiver' : 'Activer',
              icon: s.is_active ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              ),
              onClick: () => handleToggleActive(s.id, s.is_active),
            },
            { separator: true, label: '' },
            {
              label: 'Archiver',
              icon: <Trash2 className="h-4 w-4" />,
              variant: 'danger',
              onClick: () => setDeletingId(s.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher une prestation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="flex gap-2 sm:w-auto">
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: '', label: 'Toutes catégories' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              options={[
                { value: '', label: 'Tous statuts' },
                { value: 'active', label: 'Actifs' },
                { value: 'inactive', label: 'Désactivés' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(s) => s.id}
        onRowClick={(s) => (window.location.href = `/admin/prestations/${s.id}`)}
        emptyState={
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title={
              services.length === 0
                ? 'Aucune prestation pour le moment'
                : 'Aucun résultat'
            }
            description={
              services.length === 0
                ? 'Commence par créer ta première prestation pour la rendre disponible à la réservation.'
                : 'Essaie de modifier tes filtres de recherche.'
            }
            action={
              services.length === 0 ? (
                <Link href="/admin/prestations/nouveau">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Créer une prestation
                  </Button>
                </Link>
              ) : undefined
            }
          />
        }
      />

      <DeleteDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Archiver cette prestation ?"
        description="Elle ne sera plus visible publiquement, mais l'historique des réservations sera conservé. Tu peux toujours la restaurer ultérieurement."
        confirmText="Archiver"
        loading={isPending}
      />
    </div>
  );
}