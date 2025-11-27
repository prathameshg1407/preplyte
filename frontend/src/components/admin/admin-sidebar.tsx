// src/components/admin/admin-sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileBarChart,
  Settings,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Institutes', href: '/admin/institutes', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md border border-border flex items-center justify-center">
              <span className="text-sm font-semibold">P</span>
            </div>
            <span className="font-medium text-sm">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm',
            'text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Back to App' : undefined}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </Link>
      </div>
    </aside>
  );
}