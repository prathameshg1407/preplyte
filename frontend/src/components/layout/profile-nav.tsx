// src/components/layout/profile-nav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, FileText, GraduationCap, Settings } from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Student Profile',
    href: '/profile/student/edit',
    icon: GraduationCap,
  },
  {
    title: 'Resumes',
    href: '/profile/resumes',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/profile/settings',
    icon: Settings,
  },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 lg:space-x-6 border-b pb-4 mb-6">
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
              'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}