// src/components/admin/analytics/stats-cards.tsx

'use client';

import { Card, CardContent } from '../../ui/card';
import { Building2, Users, UserCheck, ShieldCheck } from 'lucide-react';

interface StatsCardsProps {
  overview: {
    totalInstitutes: number;
    activeInstitutes: number;
    totalUsers: number;
    activeUsers: number;
    totalStudents: number;
    totalInstituteAdmins: number;
  };
}

export function StatsCards({ overview }: StatsCardsProps) {
  const stats = [
    {
      title: 'Institutes',
      value: overview.totalInstitutes,
      subtitle: `${overview.activeInstitutes} active`,
      icon: Building2,
    },
    {
      title: 'Users',
      value: overview.totalUsers,
      subtitle: `${overview.activeUsers} active`,
      icon: Users,
    },
    {
      title: 'Students',
      value: overview.totalStudents,
      subtitle: 'registered',
      icon: UserCheck,
    },
    {
      title: 'Admins',
      value: overview.totalInstituteAdmins,
      subtitle: 'institute',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold tabular-nums mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}