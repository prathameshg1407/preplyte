'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  containerClass?: string;
}

export function AppLayout({ 
  children,
  containerClass
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if user is an admin
  const isAdmin = user?.role === 'PLATFORM_ADMIN' || user?.role === 'INSTITUTE_ADMIN';

  // Prevent hydration mismatch or flash of content
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Only rendered for Admins */}
      {isAdmin && (
        <AppSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <AppHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showSidebarTrigger={isAdmin}
        />
        
        <main className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8",
          // Add extra padding for students since they have a wide layout
          !isAdmin && "container mx-auto max-w-7xl",
          containerClass
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}