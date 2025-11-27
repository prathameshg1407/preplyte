// src/components/admin/institutes/institute-admins-list.tsx

'use client';

import Link from 'next/link';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Eye, ShieldCheck, Plus } from 'lucide-react';
import type { User } from '../../../types/admin.types';

interface InstituteAdminsListProps {
  admins: User[];
  loading: boolean;
}

export function InstituteAdminsList({ admins, loading }: InstituteAdminsListProps) {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-border rounded-lg">
        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center mb-3">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No admins assigned</p>
        <p className="text-sm text-muted-foreground mt-1">
          This institute doesn't have any admins yet
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-1" />
            Add Admin
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {admins.map((admin) => (
        <Card key={admin.id} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-sm font-semibold bg-secondary">
                  {(admin.name || admin.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {admin.name || 'Unnamed'}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {admin.email}
                  </p>
                </div>
              </div>
              <span className={`h-2 w-2 rounded-full shrink-0 ${admin.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {new Date(admin.createdAt).toLocaleDateString()}
              </span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link href={`/admin/users/${admin.id}`}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}