import { AppLayout } from '@/components/layout/app-layout';

interface PracticeLayoutProps {
  children: React.ReactNode;
}

export default function PracticeLayout({ children }: PracticeLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}