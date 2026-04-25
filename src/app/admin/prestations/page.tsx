import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Sparkles, FolderTree } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ServicesTable } from '@/components/admin/services/ServicesTable';
import { listServices } from '@/lib/actions/services';
import { listServiceCategories } from '@/lib/actions/service-categories';

export const metadata: Metadata = {
  title: 'Prestations',
};

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([
    listServices(),
    listServiceCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prestations"
        description="Gère ton catalogue de tresses et coiffures"
        actions={
          <>
            <Link href="/admin/prestations/categories">
              <Button variant="outline" leftIcon={<FolderTree className="h-4 w-4" />}>
                Catégories
              </Button>
            </Link>
            <Link href="/admin/prestations/nouveau">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Nouvelle prestation
              </Button>
            </Link>
          </>
        }
      />

      <ServicesTable services={services} categories={categories} />
    </div>
  );
}