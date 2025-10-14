'use client';

import { createContext, useEffect, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always use light theme
  const theme: Theme = 'light';
  const resolvedTheme: 'light' | 'dark' = 'light';

  // Apply light theme to root element on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'system');
    root.classList.add('light');
  }, []);

  // Dummy setTheme function (does nothing)
  const setTheme = (newTheme: Theme) => {
    // Do nothing - theme is always light
    console.log('Theme switching is disabled. Always using light theme.');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
