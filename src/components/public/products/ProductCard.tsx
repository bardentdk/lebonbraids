'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cover_image_url: string | null;
  stock_quantity: number;
  track_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  category?: { name: string; slug: string } | null;
}

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.track_stock && product.stock_quantity === 0;
  const hasPromo =
    product.compare_at_price && product.compare_at_price > product.price;
  const promoPercent = hasPromo
    ? Math.round(
        ((Number(product.compare_at_price) - Number(product.price)) /
          Number(product.compare_at_price)) *
          100
      )
    : 0;

  return (
    <Link
      href={`/boutique/${product.slug}`}
      data-reveal-item
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <ShoppingBag className="h-12 w-12" />
          </div>
        )}

        {/* Badges top */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_new && !hasPromo && (
            <span className="rounded-full bg-success px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white shadow-soft">
              Nouveau
            </span>
          )}
          {hasPromo && (
            <span className="rounded-full bg-danger px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white shadow-soft">
              -{promoPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white shadow-soft">
              <Star className="h-2.5 w-2.5 fill-white" />
              Best
            </span>
          )}
        </div>

        {/* Stock alert */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-950/40 backdrop-blur-sm">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase text-primary-800">
              Rupture de stock
            </span>
          </div>
        )}
        {!isOutOfStock &&
          product.track_stock &&
          product.stock_quantity <= 3 && (
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-warning/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              <AlertTriangle className="h-2.5 w-2.5" />
              Plus que {product.stock_quantity}
            </div>
          )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold tracking-tight transition-colors group-hover:text-primary-700">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold tabular-nums text-primary-700">
            {formatPrice(Number(product.price))}
          </span>
          {hasPromo && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(Number(product.compare_at_price))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}