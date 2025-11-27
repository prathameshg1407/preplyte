import { ReactNode } from 'react';
import { InstituteAdminSidebar } from '@/components/institute-admin/institute-admin-sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function InstituteAdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <InstituteAdminSidebar />
      <main className="flex-1 overflow-auto bg-muted/30 p-6">
        {children}
      </main>
    </div>
  );
}