// src/components/dashboard/platform-admin-dashboard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Users,
  TrendingUp,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const stats = [
  {
    title: 'Total Institutes',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Building2,
  },
  {
    title: 'Total Users',
    value: '12,483',
    change: '+18%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Active Mock Drives',
    value: '143',
    change: '+8%',
    trend: 'up',
    icon: Activity,
  },
  {
    title: 'Platform Growth',
    value: '34%',
    change: '-2%',
    trend: 'down',
    icon: TrendingUp,
  },
];

const recentInstitutes = [
  { name: 'Mumbai University', students: 1234, domain: 'mumbai.ac.in', status: 'Active' },
  { name: 'Delhi College', students: 856, domain: 'delhi.ac.in', status: 'Active' },
  { name: 'Pune Institute', students: 642, domain: 'pune.ac.in', status: 'Pending' },
  { name: 'Bangalore Tech', students: 1890, domain: 'blr.ac.in', status: 'Active' },
];

export function PlatformAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-gray-500 mt-1">
          Monitor and manage the entire platform
        </p>
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
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Institutes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Institutes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInstitutes.map((institute) => (
              <div
                key={institute.domain}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{institute.name}</p>
                    <p className="text-sm text-gray-500">{institute.domain}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{institute.students}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      institute.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {institute.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
