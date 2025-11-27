// src/app/layout.tsx

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from './providers';
import { AppHeader } from '@/components/layout/app-header';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const geistMono = GeistMono;

export const metadata: Metadata = {
  title: {
    default: 'Preplyte - Campus Placement Platform',
    template: '%s | Preplyte',
  },
  description: 'Comprehensive campus placement preparation platform with aptitude tests, coding challenges, and mock interviews.',
  keywords: ['campus placement', 'job preparation', 'interview prep', 'coding practice', 'aptitude test'],
  authors: [{ name: 'Preplyte' }],
  creator: 'Preplyte',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}