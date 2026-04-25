'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Package,
  AlertTriangle,
  ArrowDownUp,
  RefreshCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useDebounce } from '@/hooks/useDebounce';
import { StockAdjustmentModal } from './StockAdjustmentModal';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  cover_image_url: string | null;
  stock_quantity: number;
  stock_alert_threshold: number;
  track_stock: boolean;
  total_sold: number;
}

export function StocksList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.track_stock) return false;
      if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
        return false;
      if (filter === 'low' && p.stock_quantity > p.stock_alert_threshold) return false;
      if (filter === 'out' && p.stock_quantity > 0) return false;
      if (filter === 'ok' && p.stock_quantity <= p.stock_alert_threshold) return false;
      return true;
    });
  }, [products, debouncedSearch, filter]);

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
              <Package className="h-5 w-5" />
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
          <div className="font-medium">{p.name}</div>
          {p.sku && <div className="text-xs font-mono text-muted-foreground">{p.sku}</div>}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      align: 'right',
      render: (p) => {
        const isOut = p.stock_quantity === 0;
        const isLow = p.stock_quantity <= p.stock_alert_threshold;
        return (
          <div className="flex items-center justify-end gap-2">
            {(isLow || isOut) && (
              <AlertTriangle
                className={`h-3.5 w-3.5 ${isOut ? 'text-danger' : 'text-warning'}`}
              />
            )}
            <span
              className={`text-base font-bold tabular-nums ${
                isOut ? 'text-danger' : isLow ? 'text-warning' : 'text-foreground'
              }`}
            >
              {p.stock_quantity}
            </span>
          </div>
        );
      },
    },
    {
      key: 'threshold',
      label: 'Seuil',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums text-muted-foreground">{p.stock_alert_threshold}</span>
      ),
    },
    {
      key: 'sold',
      label: 'Vendus',
      align: 'right',
      render: (p) => <span className="tabular-nums text-muted-foreground">{p.total_sold}</span>,
    },
    {
      key: 'status',
      label: 'État',
      align: 'center',
      render: (p) => {
        if (p.stock_quantity === 0)
          return <Badge variant="danger">Rupture</Badge>;
        if (p.stock_quantity <= p.stock_alert_threshold)
          return <Badge variant="warning">Stock bas</Badge>;
        return <Badge variant="success">OK</Badge>;
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            setAdjustingProduct(p);
          }}
        >
          Ajuster
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les stocks' },
              { value: 'ok', label: 'OK' },
              { value: 'low', label: 'Stock bas' },
              { value: 'out', label: 'Rupture' },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(p) => p.id}
        emptyState={
          <EmptyState
            icon={<ArrowDownUp className="h-6 w-6" />}
            title="Aucun produit suivi"
            description="Active le suivi de stock sur tes produits pour les voir ici."
          />
        }
      />

      <StockAdjustmentModal
        open={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />
    </div>
  );
}