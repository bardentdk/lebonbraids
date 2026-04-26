import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { isShopEnabled } from '@/lib/settings/shop';
import { ProductsGrid } from '@/components/public/products/ProductsGrid';
import { unwrapOne } from '@/lib/utils/supabase-types';

export const metadata: Metadata = {
  title: 'Boutique',
  description: 'Découvrez notre sélection de produits capillaires premium.',
};

export default async function ShopPage() {
  if (!(await isShopEnabled())) notFound();

  const supabase = await createClient();
  const [{ data: rawProducts }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, slug, name, short_description, price, compare_at_price, cover_image_url, stock_quantity, track_stock, is_featured, is_new, category_id, category:product_categories(name, slug)'
      )
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('sort_order'),
    supabase
      .from('product_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  // Normalisation : on unwrap la catégorie
  const products = (rawProducts || []).map((p) => ({
    ...p,
    category: unwrapOne(p.category),
  }));

  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--color-secondary-500)) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              <ShoppingBag className="h-3 w-3" />
              {products.length} produits disponibles
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Notre <span className="text-gradient">boutique</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Sélection de produits soigneusement choisis pour vos cheveux.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductsGrid products={products} categories={categories || []} />
        </div>
      </section>
    </div>
  );
}