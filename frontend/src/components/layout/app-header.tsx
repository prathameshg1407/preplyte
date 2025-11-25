'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, Brain, Code2, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from './user-menu'; // Assuming this exists per your previous code
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showSidebarTrigger?: boolean;
}

export function AppHeader({ 
  onMenuClick, 
  showSidebarTrigger = false,
}: AppHeaderProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const isStudent = user?.role === 'USER';

  const studentLinks = [
    { label: 'Aptitude', href: '/practice/aptitude', icon: Brain },
    { label: 'Coding', href: '/practice/machine', icon: Code2 },
    { label: 'Mock Tests', href: '/dashboard/mock-tests', icon: Target },
    { label: 'Performance', href: '/dashboard/performance', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      {/* Left: Mobile Toggle / Logo (for Students) */}
      <div className="flex items-center gap-4">
        {showSidebarTrigger ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden -ml-2 text-muted-foreground"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2 lg:hidden">
            <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">P</div>
          </Link>
        )}

        {/* Student Top Navigation (Visible only to students on Desktop) */}
        {isStudent && (
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/dashboard" className="mr-4 flex items-center space-x-2">
               <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">P</div>
               <span className="font-bold hidden xl:inline-block">Preplyte</span>
            </Link>
            {studentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Center/Right: Search & Actions */}
      <div className="ml-auto flex items-center gap-4">
        {/* Search - Hidden on small mobile */}
        <div className="hidden md:flex relative w-64 lg:w-80">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={isStudent ? "Search questions..." : "Search platform..."}
            className="w-full bg-muted/40 pl-9 shadow-none focus-visible:bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background" />
          </Button>

          <div className="pl-2 border-l">
             <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}