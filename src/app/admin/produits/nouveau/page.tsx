import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { listProductCategories } from '@/lib/actions/product-categories';
import { isShopEnabled } from '@/lib/settings/shop';

export const metadata: Metadata = { title: 'Nouveau produit' };

export default async function NewProductPage() {
  if (!(await isShopEnabled())) redirect('/admin/parametres');
  const categories = await listProductCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau produit"
        description="Crée un produit pour ta boutique"
        backHref="/admin/produits"
      />
      <ProductForm categories={categories} />
    </div>
  );
}