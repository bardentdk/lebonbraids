'use client';

import { useState, useTransition } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DeleteDialog } from '@/components/admin/shared/DeleteDialog';
import { CategoryForm } from './CategoryForm';
import { deleteServiceCategory } from '@/lib/actions/service-categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  cover_image_url: string | null;
}

interface CategoriesManagerProps {
  categories: Category[];
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteServiceCategory(deletingId);
      if (res.success) {
        toast.success('Catégorie supprimée');
        setDeletingId(null);
      } else {
        toast.error(res.error);
      }
    });
  };

  if (categories.length === 0) {
    return (
      <>
        <EmptyState
          icon={<FolderTree className="h-6 w-6" />}
          title="Aucune catégorie"
          description="Crée des catégories pour organiser tes prestations (Box braids, Knotless, Twists…)"
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              Créer la première catégorie
            </Button>
          }
        />
        <CategoryForm open={creating} onClose={() => setCreating(false)} />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="group transition-all hover:shadow-soft">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <FolderTree className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{cat.name}</h3>
                  <Badge variant={cat.is_active ? 'success' : 'default'}>
                    {cat.is_active ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Badge>
                </div>
                {cat.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                )}
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(cat)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
                    aria-label="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(cat.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CategoryForm open={creating} onClose={() => setCreating(false)} />
      {/* <CategoryForm
        open={!!editing}
        onClose={() => setEditing(null)}
        initialData={editing || undefined}
      /> */}
      <CategoryForm
        open={!!editing}
        onClose={() => setEditing(null)}
        initialData={
          editing
            ? {
                ...editing,
                description: editing.description ?? undefined,
                icon: editing.icon ?? undefined,
                cover_image_url: editing.cover_image_url ?? undefined,
              }
            : undefined
        }
      />

      <DeleteDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer cette catégorie ?"
        description="Les prestations associées resteront mais perdront leur catégorie."
        loading={isPending}
      />
    </>
  );
}