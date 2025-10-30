'use client';

import type { PropsWithChildren } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AppProvider } from './AppContext';
import { StudyProvider } from './StudyContext';

// テスト用のProviders（AuthProviderを含まない）
export function TestProviders({ children }: PropsWithChildren) {
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
