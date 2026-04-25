import type { ThemeConfig } from './types';

export const defaultTheme: ThemeConfig = {
  name: 'Bleu Premium',
  colors: {
    primary: {
      50: '214 100% 97%',
      100: '214 95% 93%',
      200: '213 97% 87%',
      300: '212 96% 78%',
      400: '213 94% 68%',
      500: '217 91% 60%',
      600: '221 83% 53%',
      700: '224 76% 48%',
      800: '226 71% 40%',
      900: '224 64% 33%',
      950: '226 57% 21%',
    },
    secondary: {
      50: '48 100% 96%',
      500: '43 96% 56%',
      600: '38 92% 50%',
      900: '28 73% 26%',
    },
    accent: '262 83% 58%',
    background: '0 0% 100%',
    foreground: '224 71% 4%',
    muted: '220 14% 96%',
    mutedForeground: '220 9% 46%',
    border: '220 13% 91%',
    success: '142 76% 36%',
    warning: '38 92% 50%',
    danger: '0 84% 60%',
  },
  radius: '1rem',
  fontFamily: 'Poppins',
  isActive: true,
};

// Presets prêts à l'emploi
export const themePresets: Record<string, ThemeConfig> = {
  'bleu-premium': defaultTheme,
  rose: {
    ...defaultTheme,
    name: 'Rose Élégance',
    colors: {
      ...defaultTheme.colors,
      primary: {
        50: '327 73% 97%',
        100: '326 78% 95%',
        200: '326 85% 90%',
        300: '327 87% 82%',
        400: '329 86% 70%',
        500: '330 81% 60%',
        600: '333 71% 51%',
        700: '335 78% 42%',
        800: '336 74% 35%',
        900: '336 69% 30%',
        950: '336 84% 17%',
      },
    },
  },
  or: {
    ...defaultTheme,
    name: 'Or Royal',
    colors: {
      ...defaultTheme.colors,
      primary: {
        50: '48 100% 96%',
        100: '48 96% 89%',
        200: '48 97% 77%',
        300: '46 97% 65%',
        400: '43 96% 56%',
        500: '38 92% 50%',
        600: '32 95% 44%',
        700: '26 90% 37%',
        800: '23 83% 31%',
        900: '22 78% 26%',
        950: '21 91% 14%',
      },
    },
  },
  emeraude: {
    ...defaultTheme,
    name: 'Émeraude',
    colors: {
      ...defaultTheme.colors,
      primary: {
        50: '151 81% 96%',
        100: '149 80% 90%',
        200: '152 76% 80%',
        300: '156 72% 67%',
        400: '158 64% 52%',
        500: '160 84% 39%',
        600: '161 94% 30%',
        700: '163 94% 24%',
        800: '163 88% 20%',
        900: '164 86% 16%',
        950: '166 91% 9%',
      },
    },
  },
};