'use client';

import type { PropsWithChildren } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AppProvider } from './AppContext';
import { StudyProvider } from './StudyContext';

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AppProvider>
        <StudyProvider>
          {children}
        </StudyProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export { useTheme } from './ThemeContext';
export { useApp } from './AppContext';
export { useStudy } from './StudyContext';
export type { Deck, Card } from './AppContext';
export type { StudySession } from './StudyContext';
