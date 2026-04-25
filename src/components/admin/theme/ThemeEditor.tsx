'use client';

import { useState, useTransition } from 'react';
import { Save, Undo2, Palette, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/components/providers/ThemeProvider';
import { themePresets } from '@/lib/theme/default-theme';
import {
  generateShades,
  shadeToHex,
  hexToHslArray,
  hslString,
} from '@/lib/theme/shade-generator';
import type { ThemeConfig } from '@/lib/theme/types';

import { ThemePresetCard } from './ThemePresetCard';
import { ThemePreview } from './ThemePreview';
import { ColorPicker } from './ColorPicker';

interface ThemeEditorProps {
  savedThemes: Array<{
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    config: Omit<ThemeConfig, 'id' | 'name' | 'isActive'>;
  }>;
  activeThemeId?: string;
}

export function ThemeEditor({ savedThemes, activeThemeId }: ThemeEditorProps) {
  const { theme: currentTheme, previewTheme, setTheme } = useTheme();
  const [draft, setDraft] = useState<ThemeConfig>(currentTheme);
  const [themeName, setThemeName] = useState(currentTheme.name);
  const [selectedSavedId, setSelectedSavedId] = useState(activeThemeId);
  const [isPending, startTransition] = useTransition();

  // Couleurs dérivées en hex pour les pickers
  const primaryHex = shadeToHex(draft.colors.primary[500]);
  const secondaryHex = shadeToHex(draft.colors.secondary[500] || '0 0% 50%');
  const accentHex = shadeToHex(draft.colors.accent);

  const updateDraft = (next: ThemeConfig) => {
    setDraft(next);
    previewTheme(next);
  };

  const handlePresetSelect = (preset: ThemeConfig) => {
    const next = { ...preset, name: preset.name };
    setThemeName(preset.name);
    updateDraft(next);
    setSelectedSavedId(undefined);
  };

  const handleSavedThemeSelect = (savedTheme: typeof savedThemes[number]) => {
    const next: ThemeConfig = {
      id: savedTheme.id,
      name: savedTheme.name,
      ...savedTheme.config,
      isActive: savedTheme.is_active,
    };
    setThemeName(savedTheme.name);
    setSelectedSavedId(savedTheme.id);
    updateDraft(next);
  };

  const handlePrimaryChange = (hex: string) => {
    const shades = generateShades(hex);
    updateDraft({
      ...draft,
      colors: { ...draft.colors, primary: shades },
    });
  };

  const handleSecondaryChange = (hex: string) => {
    const shades = generateShades(hex);
    updateDraft({
      ...draft,
      colors: {
        ...draft.colors,
        secondary: {
          50: shades[50],
          500: shades[500],
          600: shades[600],
          900: shades[900],
        },
      },
    });
  };

  const handleAccentChange = (hex: string) => {
    const [h, s, l] = hexToHslArray(hex);
    updateDraft({
      ...draft,
      colors: { ...draft.colors, accent: hslString(h, s, l) },
    });
  };

  const handleReset = () => {
    setDraft(currentTheme);
    setThemeName(currentTheme.name);
    previewTheme(currentTheme);
    toast.info('Modifications annulées');
  };

  const handleSave = async (activate: boolean) => {
    startTransition(async () => {
      try {
        const slug = themeName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const payload = {
          id: selectedSavedId,
          name: themeName,
          slug: slug || `theme-${Date.now()}`,
          config: {
            colors: draft.colors,
            radius: draft.radius,
            fontFamily: draft.fontFamily,
          },
          isActive: activate,
        };

        const res = await fetch('/api/admin/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur lors de la sauvegarde');
        }

        const saved = await res.json();

        if (activate) {
          setTheme({
            id: saved.id,
            name: saved.name,
            ...saved.config,
            isActive: true,
          });
          toast.success('Thème activé sur l\'ensemble du site ✨');
        } else {
          toast.success('Thème sauvegardé');
        }

        setSelectedSavedId(saved.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce thème ?')) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/theme?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Suppression impossible');
        toast.success('Thème supprimé');
        if (selectedSavedId === id) setSelectedSavedId(undefined);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Colonne éditeur (2/3) */}
      <div className="space-y-6 xl:col-span-2">
        {/* Presets */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
                <Palette className="h-4 w-4" />
              </div>
              <CardTitle>Thèmes prêts à l'emploi</CardTitle>
            </div>
            <CardDescription>
              Choisis un thème pré-configuré ou crée le tien à partir d'un modèle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(themePresets).map(([slug, preset]) => (
                <ThemePresetCard
                  key={slug}
                  theme={preset}
                  isActive={false}
                  isSelected={
                    !selectedSavedId &&
                    draft.colors.primary[500] === preset.colors.primary[500]
                  }
                  onSelect={() => handlePresetSelect(preset)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thèmes sauvegardés */}
        {savedThemes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tes thèmes sauvegardés</CardTitle>
              <CardDescription>
                Thèmes que tu as créés ou personnalisés.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {savedThemes.map((saved) => {
                  const asConfig: ThemeConfig = {
                    id: saved.id,
                    name: saved.name,
                    ...saved.config,
                    isActive: saved.is_active,
                  };
                  return (
                    <div key={saved.id} className="group relative">
                      <ThemePresetCard
                        theme={asConfig}
                        isActive={saved.is_active}
                        isSelected={selectedSavedId === saved.id}
                        onSelect={() => handleSavedThemeSelect(saved)}
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(saved.id)}
                        disabled={saved.is_active}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-background/90 text-danger opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-danger hover:text-white group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personnalisation */}
        <Card>
          <CardHeader>
            <CardTitle>Personnalisation</CardTitle>
            <CardDescription>
              Chaque changement se reflète instantanément sur tout le site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Nom du thème"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ColorPicker
                label="Couleur principale"
                value={primaryHex}
                onChange={handlePrimaryChange}
                description="Boutons, liens"
              />
              <ColorPicker
                label="Couleur secondaire"
                value={secondaryHex}
                onChange={handleSecondaryChange}
                description="Accents"
              />
              <ColorPicker
                label="Couleur d'accent"
                value={accentHex}
                onChange={handleAccentChange}
                description="Highlights"
              />
            </div>

            {/* Nuances générées */}
            <div>
              <div className="mb-2 text-sm font-medium">Nuances générées</div>
              <div className="flex h-12 overflow-hidden rounded-xl ring-1 ring-border">
                {(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const).map((k) => (
                  <div
                    key={k}
                    className="flex-1 transition-all hover:scale-105"
                    style={{ background: `hsl(${draft.colors.primary[k]})` }}
                    title={`${k}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="sticky bottom-4 z-20 flex flex-col gap-2 rounded-2xl border border-border bg-background/90 p-4 shadow-premium backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <div className="font-semibold">Prêt à appliquer ?</div>
            <div className="text-muted-foreground">
              Sauvegarde le thème ou applique-le tout de suite.
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<Undo2 className="h-4 w-4" />}
              onClick={handleReset}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => handleSave(false)}
              loading={isPending}
            >
              Sauvegarder
            </Button>
            <Button
              type="button"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => handleSave(true)}
              loading={isPending}
            >
              Activer
            </Button>
          </div>
        </div>
      </div>

      {/* Colonne preview (1/3) */}
      <div className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <ThemePreview />
      </div>
    </div>
  );
}