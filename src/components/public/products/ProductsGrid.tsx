'use client';

import { useState, useMemo } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from './ProductCard';

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
  category_id: string | null;
  category?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export function ProductsGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category_id !== activeCategory) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, debouncedSearch, activeCategory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-10 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all',
                  activeCategory === null
                    ? 'border-primary-500 bg-gradient-primary text-white shadow-soft'
                    : 'border-border bg-background hover:border-primary-300'
                )}
              >
                <ShoppingBag className="h-3 w-3" />
                Tous ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all',
                      activeCategory === cat.id
                        ? 'border-primary-500 bg-gradient-primary text-white shadow-soft'
                        : 'border-border bg-background hover:border-primary-300'
                    )}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="Aucun produit trouvé"
              description="Modifie ta recherche ou tes filtres."
            />
          </motion.div>
        ) : (
          <motion.div
            key={`${activeCategory}-${debouncedSearch}`}
            layout
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}