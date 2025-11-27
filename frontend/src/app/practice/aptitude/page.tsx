// src/app/practice/aptitude/page.tsx

import { Metadata } from 'next';
import { PracticeConfigForm } from '../../../components/practice/aptitude';

export const metadata: Metadata = {
  title: 'Aptitude Practice | Preplyte',
  description: 'Practice aptitude questions and improve your skills',
};

export default function AptitudePracticePage() {
  return (
    <div className="container py-12 lg:py-16">
      <PracticeConfigForm />
    </div>
  );
}