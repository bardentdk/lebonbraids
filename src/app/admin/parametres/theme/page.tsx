import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ThemeEditor } from '@/components/admin/theme/ThemeEditor';

export const metadata: Metadata = {
  title: 'Thème',
};

export default async function ThemePage() {
  const supabase = await createClient();
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false });

  const activeTheme = themes?.find((t) => t.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Personnalisation du thème</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Change les couleurs du site en direct. Toutes les modifications sont
          prévisualisées en temps réel et appliquées partout une fois activées.
        </p>
      </div>

      <ThemeEditor
        savedThemes={(themes || []) as Parameters<typeof ThemeEditor>[0]['savedThemes']}
        activeThemeId={activeTheme?.id}
      />
    </div>
  );
}