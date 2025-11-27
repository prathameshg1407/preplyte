// src/app/practice/aptitude/layout.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Aptitude Practice',
    default: 'Aptitude Practice',
  },
  description: 'Practice aptitude questions and improve your skills',
};

interface AptitudeLayoutProps {
  children: React.ReactNode;
}

export default function AptitudeLayout({ children }: AptitudeLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>
      {children}
    </div>
  );
}