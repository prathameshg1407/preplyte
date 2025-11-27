// src/app/admin/reports/page.tsx

'use client';

import { useState } from 'react';
import { useReports } from '../../../lib/hooks/use-admin';
import { ReportCard } from '../../../components/admin/reports/report-card';
import { ActivityReportTable } from '../../../components/admin/reports/activity-report-table';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Building2, Users, Activity, Calendar } from 'lucide-react';
import type {
  InstituteReport,
  UserReport,
  ActivityReport,
  ReportFilters,
} from '../../../types/admin.types';

export default function ReportsPage() {
  const { getInstitutesReport, getUsersReport, getActivityReport, downloadReport } =
    useReports();

  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [institutesReport, setInstitutesReport] = useState<InstituteReport | null>(null);
  const [usersReport, setUsersReport] = useState<UserReport | null>(null);
  const [activityReport, setActivityReport] = useState<ActivityReport | null>(null);

  const [loading, setLoading] = useState({
    institutes: false,
    users: false,
    activity: false,
  });

  const [downloading, setDownloading] = useState({
    institutes: false,
    users: false,
    activity: false,
  });

  const handleGenerateReport = async (type: 'institutes' | 'users' | 'activity') => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const reportFilters = {
        startDate: filters.startDate ? `${filters.startDate}T00:00:00Z` : undefined,
        endDate: filters.endDate ? `${filters.endDate}T23:59:59Z` : undefined,
      };

      if (type === 'institutes') {
        const data = await getInstitutesReport(reportFilters);
        setInstitutesReport(data);
      } else if (type === 'users') {
        const data = await getUsersReport(reportFilters);
        setUsersReport(data);
      } else {
        const data = await getActivityReport(reportFilters);
        setActivityReport(data);
      }
    } catch (error) {
      console.error(`Failed to generate ${type} report:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDownload = async (type: 'institutes' | 'users' | 'activity') => {
    setDownloading((prev) => ({ ...prev, [type]: true }));
    try {
      const reportFilters = {
        startDate: filters.startDate ? `${filters.startDate}T00:00:00Z` : undefined,
        endDate: filters.endDate ? `${filters.endDate}T23:59:59Z` : undefined,
      };
      await downloadReport(type, reportFilters);
    } catch (error) {
      console.error(`Failed to download ${type} report:`, error);
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and export platform analytics
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-medium">Report Period</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-sm">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="h-9 w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-sm">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="h-9 w-40"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                  });
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setFilters({
                    startDate: new Date(now.getFullYear(), now.getMonth(), 1)
                      .toISOString()
                      .split('T')[0],
                    endDate: now.toISOString().split('T')[0],
                  });
                }}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), 0, 1);
                  setFilters({
                    startDate: firstDay.toISOString().split('T')[0],
                    endDate: now.toISOString().split('T')[0],
                  });
                }}
              >
                This Year
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard
          title="Institutes"
          description="Institute overview and statistics"
          icon={Building2}
          data={institutesReport}
          loading={loading.institutes}
          downloading={downloading.institutes}
          onGenerate={() => handleGenerateReport('institutes')}
          onDownload={() => handleDownload('institutes')}
          renderSummary={(data) => (
            <>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-medium tabular-nums">{data.totalCount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Generated</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(data.generatedAt)}
                </span>
              </div>
            </>
          )}
        />

        <ReportCard
          title="Users"
          description="User accounts and activity"
          icon={Users}
          data={usersReport}
          loading={loading.users}
          downloading={downloading.users}
          onGenerate={() => handleGenerateReport('users')}
          onDownload={() => handleDownload('users')}
          renderSummary={(data) => (
            <>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-medium tabular-nums">{data.totalCount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Generated</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(data.generatedAt)}
                </span>
              </div>
            </>
          )}
        />

        <ReportCard
          title="Activity"
          description="Daily platform activity"
          icon={Activity}
          data={activityReport}
          loading={loading.activity}
          downloading={downloading.activity}
          onGenerate={() => handleGenerateReport('activity')}
          onDownload={() => handleDownload('activity')}
          renderSummary={(data) => (
            <>
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">New Users</p>
                  <p className="text-sm font-medium tabular-nums">{data.summary.totalNewUsers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                  <p className="text-sm font-medium tabular-nums">{data.summary.totalSessions}</p>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Daily Avg</span>
                <span className="text-sm font-medium tabular-nums">
                  {data.summary.avgDailySessions}
                </span>
              </div>
            </>
          )}
        />
      </div>

      {/* Activity Report Table */}
      {activityReport && (
        <ActivityReportTable activities={activityReport.activities} />
      )}
    </div>
  );
}