import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { ThemeConfig } from './types';
import { defaultTheme } from './default-theme';

/**
 * Récupère le thème actif (côté serveur)
 */
export async function getActiveTheme(): Promise<ThemeConfig> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error || !data) return defaultTheme;

    return {
      id: data.id,
      name: data.name,
      ...data.config,
      isActive: data.is_active,
    } as ThemeConfig;
  } catch {
    return defaultTheme;
  }
}

/**
 * Récupère tous les thèmes (admin)
 */
export async function getAllThemes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Active un thème (browser)
 */
export async function activateTheme(themeId: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('themes')
    .update({ is_active: true })
    .eq('id', themeId);

  if (error) throw error;
}

/**
 * Met à jour ou crée un thème custom
 */
export async function saveCustomTheme(theme: {
  id?: string;
  name: string;
  slug: string;
  config: Omit<ThemeConfig, 'id' | 'name' | 'isActive'>;
  isActive?: boolean;
}) {
  const supabase = createBrowserClient();

  if (theme.id) {
    const { data, error } = await supabase
      .from('themes')
      .update({
        name: theme.name,
        config: theme.config,
        is_active: theme.isActive ?? false,
      })
      .eq('id', theme.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('themes')
    .insert({
      name: theme.name,
      slug: theme.slug,
      config: theme.config,
      is_active: theme.isActive ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Supprime un thème
 */
export async function deleteTheme(themeId: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase.from('themes').delete().eq('id', themeId);
  if (error) throw error;
}