import type { ThemeConfig } from './types';

/**
 * Applique un thème en injectant les variables CSS sur :root
 */
export function applyTheme(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const { colors, radius } = theme;

  // Primary shades
  Object.entries(colors.primary).forEach(([shade, value]) => {
    root.style.setProperty(`--color-primary-${shade}`, value);
  });

  // Secondary shades
  Object.entries(colors.secondary).forEach(([shade, value]) => {
    if (value) root.style.setProperty(`--color-secondary-${shade}`, value);
  });

  // Autres couleurs
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-foreground', colors.foreground);
  root.style.setProperty('--color-muted', colors.muted);
  root.style.setProperty('--color-muted-foreground', colors.mutedForeground);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-danger', colors.danger);

  // Radius
  root.style.setProperty('--radius', radius);
}

/**
 * Convertit HEX en HSL string (ex: "217 91% 60%")
 */
export function hexToHsl(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}