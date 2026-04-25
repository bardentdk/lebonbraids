'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slug';
import { serviceSchema, type ServiceInput } from '@/lib/validators/service';

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

export async function listServices(query?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}) {
  const supabase = await createClient();
  let req = supabase
    .from('services')
    .select('*, category:service_categories(id, name, slug)')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (query?.search) {
    req = req.ilike('name', `%${query.search}%`);
  }
  if (query?.categoryId) {
    req = req.eq('category_id', query.categoryId);
  }
  if (query?.isActive !== undefined) {
    req = req.eq('is_active', query.isActive);
  }

  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return data;
}

export async function getService(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*, category:service_categories(id, name, slug)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertService(input: ServiceInput) {
  const { supabase } = await ensureAdmin();
  const parsed = serviceSchema.safeParse(input);
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
    category_id: data.category_id || null,
    name: data.name,
    slug,
    short_description: data.short_description || null,
    description: data.description || null,
    price: data.price,
    deposit_amount: data.deposit_amount,
    duration_minutes: data.duration_minutes,
    preparation_minutes: data.preparation_minutes,
    cleanup_minutes: data.cleanup_minutes,
    cover_image_url: data.cover_image_url || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    is_featured: data.is_featured,
    is_active: data.is_active,
    max_bookings_per_day: data.max_bookings_per_day || null,
    advance_booking_days: data.advance_booking_days,
    min_notice_hours: data.min_notice_hours,
    sort_order: data.sort_order,
  };

  if (data.id) {
    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', data.id);
    if (error) return { success: false as const, error: error.message };
    revalidatePath(`/admin/prestations/${data.id}`);
  } else {
    const { data: created, error } = await supabase
      .from('services')
      .insert(payload)
      .select('id')
      .single();
    if (error) return { success: false as const, error: error.message };
    revalidatePath('/admin/prestations');
    return { success: true as const, id: created.id };
  }

  revalidatePath('/admin/prestations');
  return { success: true as const, id: data.id };
}

export async function deleteService(id: string, hardDelete = false) {
  const { supabase } = await ensureAdmin();
  if (hardDelete) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return { success: false as const, error: error.message };
  } else {
    const { error } = await supabase
      .from('services')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    if (error) return { success: false as const, error: error.message };
  }
  revalidatePath('/admin/prestations');
  return { success: true as const };
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const { supabase } = await ensureAdmin();
  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/prestations');
  return { success: true as const };
}