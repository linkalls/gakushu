'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  actions?: ReactNode;
}

export function Header({ title, subtitle, backLink, backText = '← 戻る', actions }: HeaderProps) {
  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-md transition-colors">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {backLink && (
              <Link href={backLink} className="text-sm text-blue-100 hover:text-white transition-colors">
                {backText}
              </Link>
            )}
            <h1 className="text-3xl font-bold mt-2">{title}</h1>
            {subtitle && <p className="text-blue-100 mt-2">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}
