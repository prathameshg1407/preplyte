// src/components/dashboard/student-dashboard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  Clock,
  BookOpen,
  Code,
  ArrowRight,
} from 'lucide-react';

const stats = [
  {
    title: 'Tests Completed',
    value: '24',
    total: 50,
    icon: Target,
  },
  {
    title: 'Mock Interviews',
    value: '8',
    total: 15,
    icon: Clock,
  },
  {
    title: 'Coding Problems',
    value: '156',
    total: 300,
    icon: Code,
  },
  {
    title: 'Overall Score',
    value: '78%',
    total: 100,
    icon: Trophy,
  },
];

const recentTests = [
  {
    title: 'Aptitude Test - Series 4',
    score: 85,
    total: 100,
    date: 'Nov 20, 2025',
    status: 'Completed',
  },
  {
    title: 'Technical MCQ - JavaScript',
    score: 72,
    total: 100,
    date: 'Nov 18, 2025',
    status: 'Completed',
  },
  {
    title: 'Coding Challenge - Arrays',
    score: 90,
    total: 100,
    date: 'Nov 15, 2025',
    status: 'Completed',
  },
];

const upcomingTests = [
  {
    title: 'Google Mock Drive',
    date: 'Dec 1, 2025',
    duration: '90 min',
    difficulty: 'Medium',
  },
  {
    title: 'Data Structures Quiz',
    date: 'Dec 3, 2025',
    duration: '60 min',
    difficulty: 'Hard',
  },
];

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome Back! 👋</h1>
        <p className="text-gray-500 mt-1">
          Track your progress and continue learning
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const percentage = typeof stat.total === 'number' 
            ? (parseInt(stat.value) / stat.total) * 100 
            : parseInt(stat.value);

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
                {typeof stat.total === 'number' && (
                  <>
                    <Progress value={percentage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.value} of {stat.total}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTests.map((test) => (
                <div
                  key={test.title}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{test.title}</p>
                    <p className="text-sm text-gray-500">{test.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {test.score}/{test.total}
                    </p>
                    <p className="text-xs text-green-600">{test.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Tests</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTests.map((test) => (
                <div
                  key={test.title}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{test.title}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500">
                        {test.date}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {test.duration}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          test.difficulty === 'Hard'
                            ? 'bg-red-100 text-red-700'
                            : test.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {test.difficulty}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-24 flex-col">
              <Code className="h-8 w-8 mb-2" />
              <span>Start Coding</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <BookOpen className="h-8 w-8 mb-2" />
              <span>Aptitude Test</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <Target className="h-8 w-8 mb-2" />
              <span>Mock Interview</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
