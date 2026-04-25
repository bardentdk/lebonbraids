import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { PageHeader } from '@/components/admin/shared/PageHeader';
import { CategoriesManager } from '@/components/admin/services/CategoriesManager';
import { CategoriesPageClient } from './client';
import { listServiceCategories } from '@/lib/actions/service-categories';

export const metadata: Metadata = {
  title: 'Catégories de prestations',
};

export default async function CategoriesPage() {
  const categories = await listServiceCategories();

  return (
    <div className="space-y-6">
      <CategoriesPageClient initialCategories={categories} />
    </div>
  );
}