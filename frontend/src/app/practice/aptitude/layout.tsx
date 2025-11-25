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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {children}
    </div>
  );
}