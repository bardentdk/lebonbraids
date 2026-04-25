'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ImageUpload } from '@/components/admin/shared/ImageUpload';
import { productSchema, type ProductInput } from '@/lib/validators/product';
import { upsertProduct } from '@/lib/actions/products';

interface ProductFormProps {
  initialData?: Partial<ProductInput> & { id?: string };
  categories: Array<{ id: string; name: string }>;
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
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
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: initialData?.id,
      category_id: initialData?.category_id || null,
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      short_description: initialData?.short_description || '',
      description: initialData?.description || '',
      ingredients: initialData?.ingredients || '',
      usage_instructions: initialData?.usage_instructions || '',
      price: initialData?.price ?? 0,
      compare_at_price: initialData?.compare_at_price || null,
      cost_price: initialData?.cost_price || null,
      stock_quantity: initialData?.stock_quantity ?? 0,
      stock_alert_threshold: initialData?.stock_alert_threshold ?? 5,
      track_stock: initialData?.track_stock ?? true,
      allow_backorder: initialData?.allow_backorder ?? false,
      weight_grams: initialData?.weight_grams || null,
      cover_image_url: initialData?.cover_image_url || '',
      meta_title: initialData?.meta_title || '',
      meta_description: initialData?.meta_description || '',
      tags: initialData?.tags || [],
      is_featured: initialData?.is_featured ?? false,
      is_new: initialData?.is_new ?? true,
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order ?? 0,
    },
  });

  const onSubmit = (data: ProductInput) => {
    startTransition(async () => {
      const result = await upsertProduct({
        ...data,
        cover_image_url: coverImage || '',
      });
      if (!result.success) {
        toast.error(result.error || 'Erreur');
        return;
      }
      toast.success(initialData?.id ? 'Produit mis à jour' : 'Produit créé !');
      router.push('/admin/produits');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Nom du produit" {...register('name')} error={errors.name?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="SKU" hint="Code interne unique" {...register('sku')} />
              <Input label="Code-barres" {...register('barcode')} />
            </div>
            <Input
              label="Slug (URL)"
              hint="Auto-généré si vide"
              {...register('slug')}
            />
            <Select
              label="Catégorie"
              options={[
                { value: '', label: 'Aucune' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              {...register('category_id')}
            />
            <Textarea
              label="Description courte"
              hint="200 caractères max"
              {...register('short_description')}
            />
            <Textarea label="Description complète" rows={5} {...register('description')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              type="number"
              step="0.01"
              label="Prix de vente (€)"
              {...register('price')}
              error={errors.price?.message}
            />
            <Input
              type="number"
              step="0.01"
              label="Prix barré (€)"
              hint="Optionnel — pour afficher une promo"
              {...register('compare_at_price')}
            />
            <Input
              type="number"
              step="0.01"
              label="Prix d'achat (€)"
              hint="Privé — pour calculer la marge"
              {...register('cost_price')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventaire</CardTitle>
            <CardDescription>
              Gestion du stock et des alertes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Switch
              label="Suivre le stock"
              description="Décrémente automatiquement à chaque vente"
              checked={watch('track_stock')}
              onChange={(e) => setValue('track_stock', e.target.checked)}
            />
            {watch('track_stock') && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    label="Stock actuel"
                    {...register('stock_quantity')}
                  />
                  <Input
                    type="number"
                    label="Seuil d'alerte"
                    hint="Notification quand stock ≤"
                    {...register('stock_alert_threshold')}
                  />
                </div>
                <Switch
                  label="Autoriser les commandes en rupture"
                  description="Permet d'acheter même si le stock est à 0"
                  checked={watch('allow_backorder')}
                  onChange={(e) => setValue('allow_backorder', e.target.checked)}
                />
              </>
            )}
            <Input
              type="number"
              label="Poids (g)"
              hint="Pour le calcul des frais de port (futur)"
              {...register('weight_grams')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Détails produit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Composition / Ingrédients"
              rows={3}
              {...register('ingredients')}
            />
            <Textarea
              label="Conseils d'utilisation"
              rows={3}
              {...register('usage_instructions')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Titre meta" {...register('meta_title')} />
            <Textarea label="Description meta" rows={2} {...register('meta_description')} />
          </CardContent>
        </Card>
      </div>

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
              bucket="products"
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
              label="Actif"
              description="Visible dans la boutique"
              checked={watch('is_active')}
              onChange={(e) => setValue('is_active', e.target.checked)}
            />
            <Switch
              label="Mise en avant"
              description="Apparaît dans la section vedettes"
              checked={watch('is_featured')}
              onChange={(e) => setValue('is_featured', e.target.checked)}
            />
            <Switch
              label="Nouveauté"
              description="Affiche un badge 'Nouveau'"
              checked={watch('is_new')}
              onChange={(e) => setValue('is_new', e.target.checked)}
            />
            <Input
              type="number"
              label="Ordre d'affichage"
              hint="Petit = en premier"
              {...register('sort_order')}
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
            {initialData?.id ? 'Enregistrer' : 'Créer le produit'}
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </div>
    </form>
  );
}