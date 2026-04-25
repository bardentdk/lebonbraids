import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Package, History } from 'lucide-react';

import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StocksList } from '@/components/admin/stocks/StocksList';
import { StockMovementsTable } from '@/components/admin/stocks/StockMovementsTable';
import { listProducts } from '@/lib/actions/products';
import { listStockMovements } from '@/lib/actions/stocks';
import { isShopEnabled } from '@/lib/settings/shop';

export const metadata: Metadata = { title: 'Stocks' };

export default async function StocksPage() {
  if (!(await isShopEnabled())) redirect('/admin/parametres');

  const [products, movements] = await Promise.all([
    listProducts({ isActive: true }),
    listStockMovements({ limit: 50 }),
  ]);

  const trackedProducts = products.filter((p) => p.track_stock);
  const lowStock = trackedProducts.filter(
    (p) => p.stock_quantity <= p.stock_alert_threshold
  );
  const totalUnits = trackedProducts.reduce((sum, p) => sum + p.stock_quantity, 0);
  const stockValue = trackedProducts.reduce(
    (sum, p) => sum + Number(p.price) * p.stock_quantity,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stocks"
        description="Suivi en temps réel et historique des mouvements"
      />

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBlock label="Produits suivis" value={trackedProducts.length} />
        <StatBlock
          label="Unités totales"
          value={totalUnits.toLocaleString('fr-FR')}
        />
        <StatBlock
          label="Valeur stock"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
          }).format(stockValue)}
        />
        <StatBlock
          label="Alertes"
          value={lowStock.length}
          color={lowStock.length > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* État des stocks */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
              <Package className="h-4 w-4" />
            </div>
            <CardTitle>État des stocks</CardTitle>
          </div>
          <CardDescription>
            Ajuste manuellement le stock de chaque produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StocksList
            products={trackedProducts as Parameters<typeof StocksList>[0]['products']}
          />
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
              <History className="h-4 w-4" />
            </div>
            <CardTitle>Historique des mouvements</CardTitle>
          </div>
          <CardDescription>
            Les 50 derniers mouvements de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockMovementsTable
            movements={movements as Parameters<typeof StockMovementsTable>[0]['movements']}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatBlock({
  label,
  value,
  color = 'default',
}: {
  label: string;
  value: string | number;
  color?: 'default' | 'success' | 'warning';
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${
          color === 'warning'
            ? 'text-warning'
            : color === 'success'
            ? 'text-success'
            : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}