import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, FolderTree } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { listProducts } from '@/lib/actions/products';
import { listProductCategories } from '@/lib/actions/product-categories';
import { isShopEnabled } from '@/lib/settings/shop';

export const metadata: Metadata = { title: 'Produits' };

export default async function ProductsPage() {
  if (!(await isShopEnabled())) redirect('/admin/parametres');

  const [products, categories] = await Promise.all([
    listProducts(),
    listProductCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produits"
        description="Gère ton catalogue de produits"
        actions={
          <>
            <Link href="/admin/produits/categories">
              <Button variant="outline" leftIcon={<FolderTree className="h-4 w-4" />}>
                Catégories
              </Button>
            </Link>
            <Link href="/admin/produits/nouveau">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Nouveau produit</Button>
            </Link>
          </>
        }
      />
      <ProductsTable
        products={products as Parameters<typeof ProductsTable>[0]['products']}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}