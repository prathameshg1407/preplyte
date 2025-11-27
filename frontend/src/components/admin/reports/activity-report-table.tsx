// src/components/admin/reports/activity-report-table.tsx

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import type { ActivityReportItem } from '../../../types/admin.types';

interface ActivityReportTableProps {
  activities: ActivityReportItem[];
}

export function ActivityReportTable({ activities }: ActivityReportTableProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Daily Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-h-[400px] overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="text-center font-medium">Users</TableHead>
                <TableHead className="text-center font-medium">Aptitude</TableHead>
                <TableHead className="text-center font-medium">Coding</TableHead>
                <TableHead className="text-center font-medium">Interview</TableHead>
                <TableHead className="text-center font-medium">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={activity.date} className="group">
                  <TableCell className="text-sm">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm">
                    {activity.newUsers || '—'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm">
                    {activity.aptitudeSessions || '—'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm">
                    {activity.machineSessions || '—'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm">
                    {activity.interviewSessions || '—'}
                  </TableCell>
                  <TableCell className="text-center font-medium tabular-nums text-sm">
                    {activity.totalSessions}
                  </TableCell>
                </TableRow>
              ))}
              {activities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No activity data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}