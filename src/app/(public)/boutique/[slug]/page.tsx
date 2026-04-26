import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Check, AlertTriangle, Star } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { isShopEnabled } from '@/lib/settings/shop';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('name, meta_title, meta_description, short_description')
    .eq('slug', slug)
    .single();

  return {
    title: data?.meta_title || data?.name || 'Produit',
    description: data?.meta_description || data?.short_description || '',
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isShopEnabled())) notFound();

  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, category:product_categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (!product) notFound();

  const isOutOfStock = product.track_stock && product.stock_quantity === 0;
  const hasPromo =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);

  return (
    <article>
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la boutique
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-premium">
            {product.cover_image_url ? (
              <Image
                src={product.cover_image_url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/40">
                <ShoppingBag className="h-24 w-24" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.is_new && !hasPromo && (
                <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold uppercase text-white shadow-soft">
                  Nouveau
                </span>
              )}
              {hasPromo && (
                <span className="rounded-full bg-danger px-3 py-1 text-xs font-semibold uppercase text-white shadow-soft">
                  Promo
                </span>
              )}
              {product.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-500 px-3 py-1 text-xs font-semibold uppercase text-white shadow-soft">
                  <Star className="h-3 w-3 fill-white" />
                  Best-seller
                </span>
              )}
            </div>
          </div>

          {/* Infos */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {product.category.name}
              </span>
            )}

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            {product.short_description && (
              <p className="mt-4 text-base text-muted-foreground">
                {product.short_description}
              </p>
            )}

            {/* Prix */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-primary-700">
                {formatPrice(Number(product.price))}
              </span>
              {hasPromo && (
                <span className="text-xl text-muted-foreground line-through tabular-nums">
                  {formatPrice(Number(product.compare_at_price))}
                </span>
              )}
            </div>

            {/* Stock */}
            {product.track_stock && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
                    <AlertTriangle className="h-3 w-3" />
                    Rupture de stock
                  </span>
                ) : product.stock_quantity <= 3 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    Plus que {product.stock_quantity} en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                    <Check className="h-3 w-3" />
                    En stock ({product.stock_quantity} disponibles)
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Button
                size="xl"
                fullWidth
                disabled={isOutOfStock}
                leftIcon={<ShoppingBag className="h-5 w-5" />}
                className="sm:!w-auto"
              >
                {isOutOfStock ? 'Indisponible' : 'Réserver pour récupération en salon'}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Commande à récupérer en salon. Le paiement en ligne arrive bientôt.
              </p>
            </div>

            {/* Détails */}
            {(product.description || product.ingredients || product.usage_instructions) && (
              <div className="mt-10 space-y-6 border-t border-border pt-8">
                {product.description && (
                  <div>
                    <h2 className="text-base font-semibold">Description</h2>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}
                {product.ingredients && (
                  <div>
                    <h2 className="text-base font-semibold">Composition</h2>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                      {product.ingredients}
                    </p>
                  </div>
                )}
                {product.usage_instructions && (
                  <div>
                    <h2 className="text-base font-semibold">Conseils d'utilisation</h2>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                      {product.usage_instructions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}