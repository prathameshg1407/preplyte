// src/components/institute-admin/mock-drive/analytics/department-breakdown-table.tsx

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DepartmentBreakdown } from '@/types/admin.mockdrive.types';

interface DepartmentBreakdownTableProps {
  data: DepartmentBreakdown[] | undefined;
}

export function DepartmentBreakdownTable({ data }: DepartmentBreakdownTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No department data available
      </div>
    );
  }

  // Sort by total students descending
  const sortedData = [...data].sort((a, b) => b.totalStudents - a.totalStudents);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department</TableHead>
            <TableHead className="text-center">Students</TableHead>
            <TableHead className="text-center">Completed</TableHead>
            <TableHead className="text-center">Avg Score</TableHead>
            <TableHead className="text-center">Pass Rate</TableHead>
            <TableHead className="w-32">Completion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((dept) => {
            const completionRate =
              dept.totalStudents > 0
                ? (dept.completedStudents / dept.totalStudents) * 100
                : 0;
            return (
              <TableRow key={dept.department}>
                <TableCell className="font-medium">{dept.department}</TableCell>
                <TableCell className="text-center">{dept.totalStudents}</TableCell>
                <TableCell className="text-center">{dept.completedStudents}</TableCell>
                <TableCell className="text-center">
                  {dept.averageScore !== null ? (
                    <Badge
                      variant="outline"
                      className={
                        dept.averageScore >= 70
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : dept.averageScore >= 50
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                      }
                    >
                      {dept.averageScore.toFixed(1)}%
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {dept.passRate !== null ? `${dept.passRate.toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={completionRate} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      {completionRate.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}