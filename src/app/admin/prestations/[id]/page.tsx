import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ServiceForm } from '@/components/admin/services/ServiceForm';
import { getService } from '@/lib/actions/services';
import { listServiceCategories } from '@/lib/actions/service-categories';

export const metadata: Metadata = {
  title: 'Modifier la prestation',
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [service, categories] = await Promise.all([
      getService(id),
      listServiceCategories(),
    ]);

    if (!service) notFound();

    return (
      <div className="space-y-6">
        <PageHeader
          title={service.name}
          description="Modifier les informations de cette prestation"
          backHref="/admin/prestations"
        />
        <ServiceForm
          initialData={service as Parameters<typeof ServiceForm>[0]['initialData']}
          categories={categories}
        />
      </div>
    );
  } catch {
    notFound();
  }
}