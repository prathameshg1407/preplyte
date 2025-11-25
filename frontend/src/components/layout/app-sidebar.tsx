'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  X,
  Calendar,
  Users,
  Building2,
  FileText,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const getAdminNavItems = (role: string): NavItem[] => {
  const baseItems: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  ];

  switch (role) {
    case 'PLATFORM_ADMIN':
      return [
        ...baseItems,
        { label: 'Institutes', href: '/dashboard/institutes', icon: Building2 },
        { label: 'User Management', href: '/dashboard/users', icon: Users },
        { label: 'Platform Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { label: 'System Health', href: '/dashboard/health', icon: ShieldAlert },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    
    case 'INSTITUTE_ADMIN':
      return [
        ...baseItems,
        { label: 'Students', href: '/dashboard/students', icon: Users },
        { label: 'Mock Drives', href: '/dashboard/mock-drives', icon: Calendar },
        { label: 'Assessment Reports', href: '/dashboard/reports', icon: FileText },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    
    default:
      return []; // Students return empty array (Sidebar hidden via Layout)
  }
};

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // Guard clause: If logic fails in layout, this ensures empty render for non-admins
  const navItems = getAdminNavItems(user?.role || '');

  if (navItems.length === 0) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            P
          </div>
          <span>Preplyte</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user?.name || 'Admin'}</span>
            <span className="truncate text-xs text-muted-foreground lowercase">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <Separator className="my-2" />
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-sidebar-border bg-sidebar transition-all">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar shadow-2xl transition-transform animate-in slide-in-from-left duration-300 lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}