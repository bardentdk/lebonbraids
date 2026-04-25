import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { listProductCategories } from '@/lib/actions/product-categories';
import { isShopEnabled } from '@/lib/settings/shop';
import { ProductCategoriesPageClient } from './client';

export const metadata: Metadata = { title: 'Catégories produits' };

export default async function ProductCategoriesPage() {
  if (!(await isShopEnabled())) redirect('/admin/parametres');
  const categories = await listProductCategories();

  return (
    <div className="space-y-6">
      <ProductCategoriesPageClient initialCategories={categories} />
    </div>
  );
}