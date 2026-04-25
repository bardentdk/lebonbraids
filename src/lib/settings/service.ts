import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return (data?.value as T) ?? null;
}

export async function getPublicSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('is_public', true);
  const settings: Record<string, unknown> = {};
  (data || []).forEach((s) => {
    settings[s.key] = s.value;
  });
  return settings;
}

export async function setSettingClient(key: string, value: unknown) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}