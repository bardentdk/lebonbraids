'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slug';
import {
  serviceCategorySchema,
  type ServiceCategoryInput,
} from '@/lib/validators/service';

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') throw new Error('Accès refusé');
  return { supabase, user };
}

export async function listServiceCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertServiceCategory(input: ServiceCategoryInput) {
  const { supabase } = await ensureAdmin();
  const parsed = serviceCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);
  const payload = {
    name: data.name,
    slug,
    description: data.description || null,
    icon: data.icon || null,
    cover_image_url: data.cover_image_url || null,
    sort_order: data.sort_order,
    is_active: data.is_active,
  };

  if (data.id) {
    const { error } = await supabase
      .from('service_categories')
      .update(payload)
      .eq('id', data.id);
    if (error) return { success: false as const, error: error.message };
  } else {
    const { error } = await supabase.from('service_categories').insert(payload);
    if (error) return { success: false as const, error: error.message };
  }

  revalidatePath('/admin/prestations');
  revalidatePath('/admin/prestations/categories');
  return { success: true as const };
}

export async function deleteServiceCategory(id: string) {
  const { supabase } = await ensureAdmin();
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/prestations');
  revalidatePath('/admin/prestations/categories');
  return { success: true as const };
}