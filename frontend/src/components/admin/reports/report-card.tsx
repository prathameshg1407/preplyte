// src/components/admin/reports/report-card.tsx

'use client';

import { LucideIcon, Download, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

interface ReportCardProps<T> {
  title: string;
  description: string;
  icon: LucideIcon;
  data: T | null;
  loading: boolean;
  downloading: boolean;
  onGenerate: () => void;
  onDownload: () => void;
  renderSummary: (data: T) => React.ReactNode;
}

export function ReportCard<T>({
  title,
  description,
  icon: Icon,
  data,
  loading,
  downloading,
  onGenerate,
  onDownload,
  renderSummary,
}: ReportCardProps<T>) {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
          {data && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {data ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {renderSummary(data)}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onGenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="w-full" 
            onClick={onGenerate} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              'Generate Report'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}