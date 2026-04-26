import type { ColorShades } from './types';

/**
 * Convertit un hex en HSL [h, s, l]
 */
export function hexToHslArray(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
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

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100),
  ];
}

/**
 * Convertit HSL (h, s, l en pourcentage) vers hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Retourne une string HSL formatée pour CSS : "221 83% 53%"
 */
export function hslString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

/**
 * Génère les 11 nuances (50 à 950) à partir d'une couleur hex.
 * La nuance 500 correspond à la couleur fournie (ajustée si nécessaire).
 */
export function generateShades(baseHex: string): ColorShades {
  const [h, s] = hexToHslArray(baseHex);

  // Luminosités cibles par nuance (style Tailwind)
  const lightnessMap: Record<keyof ColorShades, number> = {
    50: 97,
    100: 93,
    200: 87,
    300: 78,
    400: 68,
    500: 60,
    600: 53,
    700: 46,
    800: 38,
    900: 30,
    950: 20,
  };

  // Ajustements de saturation selon la nuance pour rendre naturel
  const saturationMap: Record<keyof ColorShades, number> = {
    50: Math.min(s + 15, 100),
    100: Math.min(s + 10, 100),
    200: Math.min(s + 5, 100),
    300: s,
    400: s,
    500: s,
    600: s,
    700: Math.max(s - 2, 40),
    800: Math.max(s - 5, 40),
    900: Math.max(s - 10, 35),
    950: Math.max(s - 15, 30),
  };

  const shades = {} as ColorShades;
  // (Object.keys(lightnessMap) as Array<keyof ColorShades>).forEach((shade) => {
  (Object.keys(lightnessMap) as unknown as Array<keyof ColorShades>).forEach((shade) => {
    shades[shade] = hslString(h, saturationMap[shade], lightnessMap[shade]);
  });

  return shades;
}

/**
 * Récupère la nuance 500 d'un ColorShades et la retourne en hex
 * (utile pour afficher le color picker sur la bonne couleur)
 */
export function shadeToHex(shadeHsl: string): string {
  const match = shadeHsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) return '#000000';
  const [, h, s, l] = match;
  return hslToHex(Number(h), Number(s), Number(l));
}