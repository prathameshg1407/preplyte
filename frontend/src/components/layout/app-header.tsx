// src/components/layout/app-header.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User, 
  LayoutDashboard, 
  Menu, 
  X,
  ChevronDown,
  BookOpen,
  Code2,
  Brain,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added AvatarImage
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';

const practiceLinks = [
  {
    title: 'Aptitude',
    href: '/practice/aptitude',
    description: 'Quantitative, verbal & logical reasoning',
    icon: Brain,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    title: 'Coding',
    href: '/practice/machine',
    description: 'DSA & programming challenges',
    icon: Code2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

const NAV_LINKS = [
  { label: 'Practice', href: '/practice', hasDropdown: true },
  { label: 'Mock Drive', href: '/mock-drive' },
  { label: 'Leaderboard', href: '/leaderboard' },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  }, [user?.name, user?.email]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              
                <GraduationCap className="h-8 w-8 text-primary" />
              <span className="hidden font-semibold sm:inline-block">
                Preplyte
              </span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="gap-1">
                {/* Practice with dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "h-9 px-3 text-sm font-medium",
                      pathname.startsWith('/practice') && "bg-secondary"
                    )}
                  >
                    Practice
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">Practice Modules</span>
                        <Link 
                          href="/practice"
                          className="text-xs text-primary hover:underline"
                        >
                          View all
                        </Link>
                      </div>
                      <div className="grid gap-2">
                        {practiceLinks.map((link) => (
                          <NavigationMenuLink key={link.href} asChild>
                            <Link
                              href={link.href}
                              className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted"
                            >
                              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', link.bg)}>
                                <link.icon className={cn('h-5 w-5', link.color)} />
                              </div>
                              <div>
                                <div className="font-medium">{link.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {link.description}
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Other nav links - FIXED: removed legacyBehavior */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/mock-drive"
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground focus:outline-none",
                        pathname.startsWith('/mock-drive')
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      Mock Drive
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/leaderboard"
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground focus:outline-none",
                        pathname.startsWith('/leaderboard')
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      Leaderboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 gap-2 px-2">
                      <Avatar className="h-7 w-7 border border-border">
                        {/* CHANGED: Show Profile Picture if available */}
                        {user?.profilePictureUrl && (
                          <AvatarImage 
                            src={user.profilePictureUrl} 
                            alt={user.name || 'User'} 
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile/settings')} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="gap-2 text-muted-foreground focus:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
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
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <div className="space-y-1 py-4">
                {/* Practice section */}
                <div className="px-3 py-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Practice
                  </span>
                </div>
                {practiceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', link.bg)}>
                      <link.icon className={cn('h-4 w-4', link.color)} />
                    </div>
                    <div>
                      <div>{link.title}</div>
                      <div className="text-xs text-muted-foreground">{link.description}</div>
                    </div>
                  </Link>
                ))}

                <div className="my-2 border-t border-border" />

                <Link
                  href="/mock-drive"
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith('/mock-drive')
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Trophy className="h-4 w-4" />
                  Mock Drive
                </Link>

                <Link
                  href="/leaderboard"
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith('/leaderboard')
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Leaderboard
                </Link>

                {!isAuthenticated && (
                  <>
                    <div className="my-2 border-t border-border" />
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}