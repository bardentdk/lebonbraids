'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { CategoriesManager } from '@/components/admin/services/CategoriesManager';
import { CategoryForm } from '@/components/admin/services/CategoryForm';

interface Props {
  initialCategories: Awaited<
    ReturnType<typeof import('@/lib/actions/service-categories').listServiceCategories>
  >;
}

export function CategoriesPageClient({ initialCategories }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Catégories de prestations"
        description="Organise ton catalogue par catégories (Box braids, Knotless…)"
        backHref="/admin/prestations"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nouvelle catégorie
          </Button>
        }
      />

      <CategoriesManager categories={initialCategories} />

      <CategoryForm open={creating} onClose={() => setCreating(false)} />
    </>
  );
}