'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slug';
import { productSchema, type ProductInput } from '@/lib/validators/product';

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
  return { supabase };
}

export async function listProducts(query?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
}) {
  const supabase = await createClient();
  let req = supabase
    .from('products')
    .select('*, category:product_categories(id, name, slug)')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (query?.search) req = req.ilike('name', `%${query.search}%`);
  if (query?.categoryId) req = req.eq('category_id', query.categoryId);
  if (query?.isActive !== undefined) req = req.eq('is_active', query.isActive);

  const { data, error } = await req;
  if (error) throw new Error(error.message);

  let products = data || [];
  if (query?.lowStockOnly) {
    products = products.filter(
      (p) => p.track_stock && p.stock_quantity <= p.stock_alert_threshold
    );
  }
  return products;
}

export async function getProduct(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:product_categories(id, name, slug)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertProduct(input: ProductInput) {
  const { supabase } = await ensureAdmin();
  const parsed = productSchema.safeParse(input);
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
    sku: data.sku || null,
    barcode: data.barcode || null,
    name: data.name,
    slug,
    short_description: data.short_description || null,
    description: data.description || null,
    ingredients: data.ingredients || null,
    usage_instructions: data.usage_instructions || null,
    price: data.price,
    compare_at_price: data.compare_at_price || null,
    cost_price: data.cost_price || null,
    stock_quantity: data.stock_quantity,
    stock_alert_threshold: data.stock_alert_threshold,
    track_stock: data.track_stock,
    allow_backorder: data.allow_backorder,
    weight_grams: data.weight_grams || null,
    cover_image_url: data.cover_image_url || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    tags: data.tags,
    is_featured: data.is_featured,
    is_new: data.is_new,
    is_active: data.is_active,
    sort_order: data.sort_order,
  };

  if (data.id) {
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', data.id);
    if (error) return { success: false as const, error: error.message };
    revalidatePath(`/admin/produits/${data.id}`);
    revalidatePath('/admin/produits');
    return { success: true as const, id: data.id };
  }

  const { data: created, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id')
    .single();
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/produits');
  return { success: true as const, id: created.id };
}

export async function deleteProduct(id: string, hard = false) {
  const { supabase } = await ensureAdmin();
  if (hard) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { success: false as const, error: error.message };
  } else {
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    if (error) return { success: false as const, error: error.message };
  }
  revalidatePath('/admin/produits');
  return { success: true as const };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { supabase } = await ensureAdmin();
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/produits');
  return { success: true as const };
}