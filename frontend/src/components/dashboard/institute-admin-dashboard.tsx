// src/components/dashboard/institute-admin-dashboard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  GraduationCap,
  Calendar,
  Trophy,
  TrendingUp,
  Plus,
} from 'lucide-react';

const stats = [
  {
    title: 'Total Students',
    value: '1,234',
    change: '+45 this month',
    icon: GraduationCap,
  },
  {
    title: 'Active Mock Drives',
    value: '8',
    change: '3 scheduled',
    icon: Calendar,
  },
  {
    title: 'Placements',
    value: '156',
    change: '+12 this week',
    icon: Trophy,
  },
  {
    title: 'Success Rate',
    value: '78%',
    change: '+5% from last year',
    icon: TrendingUp,
  },
];

const upcomingDrives = [
  {
    company: 'Google',
    date: 'Dec 15, 2025',
    positions: 5,
    applicants: 145,
  },
  {
    company: 'Microsoft',
    date: 'Dec 20, 2025',
    positions: 8,
    applicants: 203,
  },
  {
    company: 'Amazon',
    date: 'Dec 25, 2025',
    positions: 12,
    applicants: 189,
  },
];

export function InstituteAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Institute Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage your institute's placement activities
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Mock Drive
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Mock Drives */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Mock Drives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingDrives.map((drive) => (
              <div
                key={drive.company}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <span className="text-xl font-bold text-blue-600">
                      {drive.company.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{drive.company}</p>
                    <p className="text-sm text-gray-500">{drive.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{drive.positions}</p>
                    <p className="text-xs text-gray-500">Positions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{drive.applicants}</p>
                    <p className="text-xs text-gray-500">Applicants</p>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
