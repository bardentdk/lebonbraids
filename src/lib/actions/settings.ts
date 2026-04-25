'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

export async function updateSetting(
  key: string,
  value: unknown,
  opts?: { isPublic?: boolean; description?: string; category?: string }
) {
  const { supabase, user } = await ensureAdmin();
  const payload: Record<string, unknown> = {
    key,
    value,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  if (opts?.isPublic !== undefined) payload.is_public = opts.isPublic;
  if (opts?.description) payload.description = opts.description;
  if (opts?.category) payload.category = opts.category;

  const { error } = await supabase.from('site_settings').upsert(payload);
  if (error) return { success: false as const, error: error.message };

  revalidatePath('/', 'layout');
  return { success: true as const };
}

export async function toggleShop(enabled: boolean) {
  return updateSetting('shop.enabled', enabled, {
    isPublic: true,
    description: 'Boutique active sur le site',
    category: 'shop',
  });
}