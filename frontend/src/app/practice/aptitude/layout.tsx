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
    <div className="min-h-screen bg-background">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-secondary/50 to-transparent -z-10" />
      {children}
    </div>
  );
}