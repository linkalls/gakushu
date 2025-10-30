'use client';

import type { PropsWithChildren } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { StudyProvider } from './StudyContext';

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <StudyProvider>
            {children}
          </StudyProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export { useTheme } from './ThemeContext';
export { useAuth } from './AuthContext';
export { useApp } from './AppContext';
export { useStudy } from './StudyContext';
export type { Deck, Card } from './AppContext';
export type { StudySession } from './StudyContext';
