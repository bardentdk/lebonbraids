'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import {
  serviceCategorySchema,
  type ServiceCategoryInput,
} from '@/lib/validators/service';
import { upsertServiceCategory } from '@/lib/actions/service-categories';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ServiceCategoryInput> & { id?: string };
}

export function CategoryForm({ open, onClose, initialData }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ServiceCategoryInput>({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      icon: initialData?.icon || 'Sparkles',
      cover_image_url: initialData?.cover_image_url || '',
      sort_order: initialData?.sort_order ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = (data: ServiceCategoryInput) => {
    startTransition(async () => {
      const result = await upsertServiceCategory(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initialData?.id ? 'Catégorie mise à jour' : 'Catégorie créée');
      reset();
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData?.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
            {initialData?.id ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Nom"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Slug (URL)"
          hint="Laissé vide, il sera généré automatiquement"
          {...register('slug')}
        />
        <Textarea
          label="Description"
          rows={3}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Icône Lucide"
            hint="Ex: Sparkles, Crown, Heart"
            {...register('icon')}
          />
          <Input
            type="number"
            label="Ordre"
            hint="Plus petit = en premier"
            {...register('sort_order')}
          />
        </div>
        <Switch
          label="Active"
          description="Visible sur le site"
          checked={watch('is_active')}
          onChange={(e) => setValue('is_active', e.target.checked)}
        />
      </form>
    </Modal>
  );
}