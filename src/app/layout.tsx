import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
