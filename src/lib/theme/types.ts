export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemeConfig {
  id?: string;
  name: string;
  colors: {
    primary: ColorShades;
    secondary: Partial<ColorShades>;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  radius: string;
  fontFamily: string;
  isActive?: boolean;
}