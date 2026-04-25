'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ThemeConfig } from '@/lib/theme/types';

interface ThemePresetCardProps {
  theme: ThemeConfig;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemePresetCard({
  theme,
  isActive,
  isSelected,
  onSelect,
}: ThemePresetCardProps) {
  const shades = theme.colors.primary;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all',
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-premium'
          : 'border-border hover:border-primary-300 hover:shadow-soft'
      )}
    >
      {/* Bannière gradient */}
      <div
        className="h-24 rounded-xl"
        style={{
          background: `linear-gradient(135deg, hsl(${shades[500]}), hsl(${shades[800]}))`,
        }}
      />

      {/* Palette de nuances */}
      <div className="flex gap-0.5">
        {(['50', '200', '400', '500', '600', '800', '950'] as const).map((k) => (
          <div
            key={k}
            className="h-6 flex-1 rounded"
            style={{ background: `hsl(${shades[k]})` }}
            title={`${k}: ${shades[k]}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{theme.name}</div>
          {isActive && (
            <div className="mt-0.5 text-xs font-medium text-success">
              Actuellement actif
            </div>
          )}
        </div>
        {isSelected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-soft">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}