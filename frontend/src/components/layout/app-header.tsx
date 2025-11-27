// src/components/layout/app-header.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Practice', href: '/practice' },
  { label: 'Mock Drive', href: '/mock-drive' },
  { label: 'Leaderboard', href: '/leaderboard' },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background text-sm font-semibold">
                P
              </div>
              <span className="hidden font-semibold sm:inline-block">
                Preplyte
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-foreground" />
                  <span className="sr-only">Notifications</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 rounded-full p-0"
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-secondary text-xs font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    {/* User Info */}
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-muted-foreground focus:text-foreground"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <>
                  <div className="my-2 border-t border-border" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}