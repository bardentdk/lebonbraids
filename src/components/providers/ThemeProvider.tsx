'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { defaultTheme } from '@/lib/theme/default-theme';
import { applyTheme } from '@/lib/theme/theme-utils';
import type { ThemeConfig } from '@/lib/theme/types';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  previewTheme: (theme: ThemeConfig) => void;
  resetPreview: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: ThemeConfig;
}) {
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(
    initialTheme || defaultTheme
  );
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(
    initialTheme || defaultTheme
  );
  const [isLoading, setIsLoading] = useState(true);

  // Applique le thème au mount
  useEffect(() => {
    applyTheme(activeTheme);
    setIsLoading(false);
  }, [activeTheme]);

  const setTheme = useCallback((newTheme: ThemeConfig) => {
    setSavedTheme(newTheme);
    setActiveTheme(newTheme);
  }, []);

  const previewTheme = useCallback((theme: ThemeConfig) => {
    setActiveTheme(theme);
  }, []);

  const resetPreview = useCallback(() => {
    setActiveTheme(savedTheme);
  }, [savedTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        setTheme,
        previewTheme,
        resetPreview,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}