// src/components/admin/admin-header.tsx

'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ThemeToggle } from '../theme-toggle';

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      {/* Left: Title or Search */}
      <div className="flex items-center gap-4 flex-1">
        {title ? (
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        ) : (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-9 pl-9 bg-secondary/50 border-0 focus-visible:bg-background focus-visible:ring-1"
            />
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/40 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
          </span>
        </Button>
      </div>
    </header>
  );
}