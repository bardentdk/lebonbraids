'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Eye, Star } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ImageUpload } from '@/components/admin/shared/ImageUpload';
import { serviceSchema, type ServiceInput } from '@/lib/validators/service';
import { upsertService } from '@/lib/actions/services';

type ServiceFormValues = z.input<typeof serviceSchema>;
interface ServiceFormProps {
  initialData?: Partial<ServiceInput> & { id?: string };
  categories: Array<{ id: string; name: string }>;
}

export function ServiceForm({ initialData, categories }: ServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState<string | null>(
    initialData?.cover_image_url || null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  // } = useForm<ServiceInput>({
    } = useForm<ServiceFormValues, unknown, ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      id: initialData?.id,
      category_id: initialData?.category_id || null,
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      short_description: initialData?.short_description || '',
      description: initialData?.description || '',
      price: initialData?.price ?? 0,
      deposit_amount: initialData?.deposit_amount ?? 0,
      duration_minutes: initialData?.duration_minutes ?? 60,
      preparation_minutes: initialData?.preparation_minutes ?? 0,
      cleanup_minutes: initialData?.cleanup_minutes ?? 0,
      cover_image_url: initialData?.cover_image_url || '',
      meta_title: initialData?.meta_title || '',
      meta_description: initialData?.meta_description || '',
      is_featured: initialData?.is_featured ?? false,
      is_active: initialData?.is_active ?? true,
      max_bookings_per_day: initialData?.max_bookings_per_day || null,
      advance_booking_days: initialData?.advance_booking_days ?? 60,
      min_notice_hours: initialData?.min_notice_hours ?? 24,
      sort_order: initialData?.sort_order ?? 0,
    },
  });

  const onSubmit = (data: ServiceInput) => {
    startTransition(async () => {
      const result = await upsertService({
        ...data,
        cover_image_url: coverImage || '',
      });
      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la sauvegarde');
        return;
      }
      toast.success(
        initialData?.id ? 'Prestation mise à jour' : 'Prestation créée !'
      );
      router.push('/admin/prestations');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Colonne principale */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
            <CardDescription>
              Les infos visibles publiquement par tes clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom de la prestation"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Slug (URL)"
              hint="Laissé vide, il sera généré automatiquement"
              {...register('slug')}
              error={errors.slug?.message}
            />
            <Select
              label="Catégorie"
              options={[
                { value: '', label: 'Aucune' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              {...register('category_id')}
              error={errors.category_id?.message}
            />
            <Textarea
              label="Description courte"
              hint="Affichée dans les listes (200 caractères max)"
              {...register('short_description')}
              error={errors.short_description?.message}
            />
            <Textarea
              label="Description complète"
              rows={6}
              {...register('description')}
              error={errors.description?.message}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarif & durée</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="number"
              step="0.01"
              label="Prix (€)"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
            <Input
              type="number"
              step="0.01"
              label="Acompte demandé (€)"
              hint="0 = pas d'acompte"
              {...register('deposit_amount', { valueAsNumber: true })}
              error={errors.deposit_amount?.message}
            />
            <Input
              type="number"
              label="Durée (minutes)"
              {...register('duration_minutes', { valueAsNumber: true })}
              error={errors.duration_minutes?.message}
            />
            <Input
              type="number"
              label="Préparation (min)"
              hint="Avant la prestation"
              {...register('preparation_minutes', { valueAsNumber: true })}
              error={errors.preparation_minutes?.message}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réservation</CardTitle>
            <CardDescription>
              Règles pour la prise de rendez-vous en ligne.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="number"
              label="Réservation jusqu'à (jours)"
              hint="Ex: 60 = 2 mois à l'avance"
              {...register('advance_booking_days', { valueAsNumber: true })}
            />
            <Input
              type="number"
              label="Délai mini avant RDV (heures)"
              hint="Ex: 24 = 1 jour avant"
              {...register('min_notice_hours', { valueAsNumber: true })}
            />
            <Input
              type="number"
              label="Max réservations / jour"
              hint="Vide = illimité"
              {...register('max_bookings_per_day', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              Optionnel — pour optimiser le référencement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Titre meta"
              hint="60 caractères max recommandés"
              {...register('meta_title')}
            />
            <Textarea
              label="Description meta"
              rows={2}
              hint="160 caractères max recommandés"
              {...register('meta_description')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Colonne latérale */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Image principale</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={coverImage}
              onChange={(url) => {
                setCoverImage(url);
                setValue('cover_image_url', url || '');
              }}
              bucket="services"
              folder="covers"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Switch
              label="Active"
              description="Visible publiquement et réservable"
              checked={watch('is_active')}
              onChange={(e) => setValue('is_active', e.target.checked)}
            />
            <Switch
              label="Mise en avant"
              description="Apparaît dans la section vedettes"
              checked={watch('is_featured')}
              onChange={(e) => setValue('is_featured', e.target.checked)}
            />
            <Input
              type="number"
              label="Ordre d'affichage"
              hint="Petit = en premier"
              {...register('sort_order', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        <div className="sticky bottom-4 flex flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {initialData?.id ? 'Enregistrer' : 'Créer la prestation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.back()}
          >
            Annuler
          </Button>
        </div>
      </div>
    </form>
  );
}