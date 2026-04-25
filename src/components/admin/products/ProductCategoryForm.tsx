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
  productCategorySchema,
  type ProductCategoryInput,
} from '@/lib/validators/product';
import { upsertProductCategory } from '@/lib/actions/product-categories';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ProductCategoryInput> & { id?: string };
}

export function ProductCategoryForm({ open, onClose, initialData }: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductCategoryInput>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      icon: initialData?.icon || 'Package',
      sort_order: initialData?.sort_order ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = (data: ProductCategoryInput) => {
    startTransition(async () => {
      const res = await upsertProductCategory(data);
      if (!res.success) return toast.error(res.error);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nom" {...register('name')} error={errors.name?.message} />
        <Input label="Slug (URL)" hint="Auto-généré si vide" {...register('slug')} />
        <Textarea label="Description" rows={3} {...register('description')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Icône Lucide" hint="Ex: Package, Droplet" {...register('icon')} />
          <Input type="number" label="Ordre" {...register('sort_order')} />
        </div>
        <Switch
          label="Active"
          checked={watch('is_active')}
          onChange={(e) => setValue('is_active', e.target.checked)}
        />
      </form>
    </Modal>
  );
}