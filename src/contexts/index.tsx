'use client';

import type { PropsWithChildren } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { StudyProvider } from './StudyContext';
import { SharingProvider } from './SharingContext';
import { RankingProvider } from './RankingContext';
import { SyncProvider } from './SyncContext';
import { TemplateProvider } from './TemplateContext';
import { VoiceProvider } from './VoiceContext';

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <AppProvider>
            <StudyProvider>
              <SharingProvider>
                <RankingProvider>
                  <TemplateProvider>
                    <VoiceProvider>
                      {children}
                    </VoiceProvider>
                  </TemplateProvider>
                </RankingProvider>
              </SharingProvider>
            </StudyProvider>
          </AppProvider>
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export { useTheme } from './ThemeContext';
export { useAuth } from './AuthContext';
export { useApp } from './AppContext';
export { useStudy } from './StudyContext';
export { useSharing } from './SharingContext';
export { useRanking } from './RankingContext';
export { useSync } from './SyncContext';
export { useTemplate } from './TemplateContext';
export { useVoice } from './VoiceContext';
export type { Deck, Card } from './AppContext';
export type { StudySession } from './StudyContext';
