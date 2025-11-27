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
  title: 'Preplyte - Campus Placement Platform',
  description: 'Comprehensive campus placement preparation platform',
  keywords: ['campus placement', 'job preparation', 'interview prep', 'coding practice'],
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
          <AppHeader />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}