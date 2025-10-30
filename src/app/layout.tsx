import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/contexts';

export const metadata: Metadata = {
  title: 'Anki Alternative - SRS学習アプリ',
  description: 'Anki完全互換の間隔反復学習アプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
