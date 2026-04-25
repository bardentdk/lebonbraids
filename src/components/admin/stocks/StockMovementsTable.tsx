'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUp, ArrowDown, RefreshCcw, Trash2 } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

interface Movement {
  id: string;
  type: 'in' | 'out' | 'adjustment' | 'loss';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    cover_image_url: string | null;
  };
  creator?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export function StockMovementsTable({ movements }: { movements: Movement[] }) {
  const TYPE_CONFIG = {
    in: { label: 'Entrée', icon: ArrowUp, variant: 'success' as const },
    out: { label: 'Sortie', icon: ArrowDown, variant: 'warning' as const },
    adjustment: { label: 'Ajustement', icon: RefreshCcw, variant: 'primary' as const },
    loss: { label: 'Perte', icon: Trash2, variant: 'danger' as const },
  };

  const columns: Column<Movement>[] = [
    {
      key: 'date',
      label: 'Date',
      render: (m) => (
        <div className="text-xs">
          <div className="font-medium">
            {format(new Date(m.created_at), 'd MMM yyyy', { locale: fr })}
          </div>
          <div className="text-muted-foreground">
            {format(new Date(m.created_at), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      label: 'Produit',
      render: (m) =>
        m.product ? (
          <div className="flex items-center gap-2.5">
            {m.product.cover_image_url && (
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md ring-1 ring-border">
                <Image
                  src={m.product.cover_image_url}
                  alt={m.product.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-sm font-medium">{m.product.name}</span>
          </div>
        ) : (
          <span className="text-xs italic text-muted-foreground">Produit supprimé</span>
        ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (m) => {
        const conf = TYPE_CONFIG[m.type];
        const Icon = conf.icon;
        return (
          <Badge variant={conf.variant}>
            <Icon className="h-3 w-3" /> {conf.label}
          </Badge>
        );
      },
    },
    {
      key: 'quantity',
      label: 'Quantité',
      align: 'right',
      render: (m) => (
        <span
          className={`font-semibold tabular-nums ${
            m.quantity > 0 ? 'text-success' : 'text-danger'
          }`}
        >
          {m.quantity > 0 ? '+' : ''}
          {m.quantity}
        </span>
      ),
    },
    {
      key: 'change',
      label: 'Stock',
      align: 'right',
      render: (m) => (
        <span className="tabular-nums text-muted-foreground">
          {m.previous_stock} → <span className="font-semibold text-foreground">{m.new_stock}</span>
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Raison',
      render: (m) => (
        <span className="text-sm text-muted-foreground">{m.reason || '—'}</span>
      ),
    },
    {
      key: 'creator',
      label: 'Par',
      render: (m) => (
        <span className="text-xs text-muted-foreground">
          {m.creator
            ? `${m.creator.first_name || ''} ${m.creator.last_name || ''}`.trim() || 'Système'
            : 'Système'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={movements}
      columns={columns}
      rowKey={(m) => m.id}
      emptyState={
        <EmptyState
          icon={<RefreshCcw className="h-6 w-6" />}
          title="Aucun mouvement de stock"
          description="L'historique des entrées/sorties apparaîtra ici."
        />
      }
    />
  );
}