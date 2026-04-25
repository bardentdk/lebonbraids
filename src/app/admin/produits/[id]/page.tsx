import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { getProduct } from '@/lib/actions/products';
import { listProductCategories } from '@/lib/actions/product-categories';
import { isShopEnabled } from '@/lib/settings/shop';

export const metadata: Metadata = { title: 'Modifier produit' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isShopEnabled())) redirect('/admin/parametres');
  const { id } = await params;

  try {
    const [product, categories] = await Promise.all([
      getProduct(id),
      listProductCategories(),
    ]);
    if (!product) notFound();

    return (
      <div className="space-y-6">
        <PageHeader
          title={product.name}
          description="Modifier les informations du produit"
          backHref="/admin/produits"
        />
        <ProductForm
          initialData={product as Parameters<typeof ProductForm>[0]['initialData']}
          categories={categories}
        />
      </div>
    );
  } catch {
    notFound();
  }
}