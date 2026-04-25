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
  ShoppingBag,
  Plus,
  Star,
  AlertTriangle,
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
import { formatPrice } from '@/lib/utils/format';
import { deleteProduct, toggleProductActive } from '@/lib/actions/products';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  category?: { id: string; name: string } | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  stock_alert_threshold: number;
  track_stock: boolean;
  cover_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  total_sold: number;
}

interface Props {
  products: Product[];
  categories: Array<{ id: string; name: string }>;
}

export function ProductsTable({ products, categories }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      if (categoryFilter && p.category_id !== categoryFilter) return false;
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;
      if (
        stockFilter === 'low' &&
        !(p.track_stock && p.stock_quantity <= p.stock_alert_threshold)
      )
        return false;
      if (stockFilter === 'out' && p.stock_quantity > 0) return false;
      return true;
    });
  }, [products, debouncedSearch, categoryFilter, statusFilter, stockFilter]);

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductActive(id, !current);
      if (res.success) {
        toast.success(current ? 'Produit désactivé' : 'Produit activé');
      } else toast.error(res.error);
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteProduct(deletingId);
      if (res.success) {
        toast.success('Produit archivé');
        setDeletingId(null);
      } else toast.error(res.error);
    });
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      label: '',
      width: '64px',
      render: (p) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
          {p.cover_image_url ? (
            <Image src={p.cover_image_url} alt={p.name} fill sizes="48px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ShoppingBag className="h-5 w-5" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Produit',
      render: (p) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{p.name}</span>
            {p.is_featured && <Star className="h-3.5 w-3.5 fill-secondary-500 text-secondary-500" />}
          </div>
          <div className="mt-0.5 flex gap-1.5 text-xs text-muted-foreground">
            {p.sku && <span className="font-mono">{p.sku}</span>}
            {p.category && <span>· {p.category.name}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      align: 'right',
      render: (p) => (
        <div className="text-right">
          <div className="font-semibold tabular-nums">{formatPrice(p.price)}</div>
          {p.compare_at_price && p.compare_at_price > p.price && (
            <div className="text-xs text-muted-foreground line-through">
              {formatPrice(p.compare_at_price)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      align: 'right',
      render: (p) => {
        if (!p.track_stock) {
          return <span className="text-xs text-muted-foreground">∞</span>;
        }
        const isLow = p.stock_quantity <= p.stock_alert_threshold;
        const isOut = p.stock_quantity === 0;
        return (
          <div
            className={`inline-flex items-center gap-1 font-medium tabular-nums ${
              isOut ? 'text-danger' : isLow ? 'text-warning' : 'text-foreground'
            }`}
          >
            {(isLow || isOut) && <AlertTriangle className="h-3 w-3" />}
            {p.stock_quantity}
          </div>
        );
      },
    },
    {
      key: 'sold',
      label: 'Vendus',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums text-muted-foreground">{p.total_sold}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      align: 'center',
      render: (p) => (
        <Badge variant={p.is_active ? 'success' : 'default'}>
          {p.is_active ? 'Actif' : 'Désactivé'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      align: 'right',
      render: (p) => (
        <Dropdown
          trigger={
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          }
          items={[
            {
              label: 'Modifier',
              icon: <Edit2 className="h-4 w-4" />,
              onClick: () => (window.location.href = `/admin/produits/${p.id}`),
            },
            {
              label: p.is_active ? 'Désactiver' : 'Activer',
              icon: p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
              onClick: () => handleToggle(p.id, p.is_active),
            },
            { separator: true, label: '' },
            {
              label: 'Archiver',
              icon: <Trash2 className="h-4 w-4" />,
              variant: 'danger',
              onClick: () => setDeletingId(p.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={[{ value: '', label: 'Catégories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            options={[
              { value: '', label: 'Statuts' },
              { value: 'active', label: 'Actifs' },
              { value: 'inactive', label: 'Désactivés' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            options={[
              { value: '', label: 'Stock' },
              { value: 'low', label: 'Stock bas' },
              { value: 'out', label: 'Rupture' },
            ]}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(p) => p.id}
        onRowClick={(p) => (window.location.href = `/admin/produits/${p.id}`)}
        emptyState={
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title={products.length === 0 ? 'Aucun produit' : 'Aucun résultat'}
            description={
              products.length === 0
                ? 'Crée ton premier produit pour démarrer la vente.'
                : 'Modifie tes filtres.'
            }
            action={
              products.length === 0 ? (
                <Link href="/admin/produits/nouveau">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>Créer un produit</Button>
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
        title="Archiver ce produit ?"
        description="Il ne sera plus en vente, mais l'historique reste."
        confirmText="Archiver"
        loading={isPending}
      />
    </div>
  );
}