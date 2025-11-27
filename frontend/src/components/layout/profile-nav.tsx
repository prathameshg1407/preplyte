// src/components/layout/profile-nav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, FileText, GraduationCap, Settings } from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/profile',
    icon: User,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Student Profile',
    href: '/profile/student/edit',
    icon: GraduationCap,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    title: 'Resumes',
    href: '/profile/resumes',
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Settings',
    href: '/profile/settings',
    icon: Settings,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 overflow-x-auto">
      <div className="flex gap-2 border-b border-border pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/profile'
              ? pathname === '/profile'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                isActive ? item.bg : 'bg-transparent'
              )}>
                <Icon className={cn('h-4 w-4', isActive ? item.color : '')} />
              </div>
              <span className="hidden sm:inline">{item.title}</span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}