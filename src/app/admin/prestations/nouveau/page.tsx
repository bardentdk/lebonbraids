import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ServiceForm } from '@/components/admin/services/ServiceForm';
import { listServiceCategories } from '@/lib/actions/service-categories';

export const metadata: Metadata = {
  title: 'Nouvelle prestation',
};

export default async function NewServicePage() {
  const categories = await listServiceCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle prestation"
        description="Crée une nouvelle prestation de tresses ou coiffure"
        backHref="/admin/prestations"
      />
      <ServiceForm categories={categories} />
    </div>
  );
}