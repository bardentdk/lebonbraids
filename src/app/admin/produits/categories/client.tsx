'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ProductCategoriesManager } from '@/components/admin/products/ProductCategoriesManager';
import { ProductCategoryForm } from '@/components/admin/products/ProductCategoryForm';

interface Props {
  initialCategories: Awaited<
    ReturnType<typeof import('@/lib/actions/product-categories').listProductCategories>
  >;
}

export function ProductCategoriesPageClient({ initialCategories }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Catégories produits"
        description="Organise ta boutique par catégories"
        backHref="/admin/produits"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nouvelle catégorie
          </Button>
        }
      />
      <ProductCategoriesManager categories={initialCategories} />
      <ProductCategoryForm open={creating} onClose={() => setCreating(false)} />
    </>
  );
}