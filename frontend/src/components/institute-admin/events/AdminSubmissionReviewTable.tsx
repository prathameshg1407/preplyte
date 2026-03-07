// src/components/institute-admin/events/AdminSubmissionReviewTable.tsx

'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Github, 
  ExternalLink,
  MessageSquare,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Youtube
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface AdminSubmissionReviewTableProps {
  items: any[];
  isLoading: boolean;
  onReview: (id: string) => void;
}

export function AdminSubmissionReviewTable({ items, isLoading, onReview }: AdminSubmissionReviewTableProps) {
  if (isLoading) return <TableSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/10">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Trophy className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No submissions yet</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Submissions will appear here once teams start submitting their projects.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Project</TableHead>
            <TableHead className="font-bold">Team/User</TableHead>
            <TableHead className="font-bold">Links</TableHead>
            <TableHead className="font-bold">Score</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-right font-bold tracking-tight">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex flex-col max-w-[200px]">
                  <span className="font-bold truncate" title={item.projectName}>{item.projectName}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{item.projectDescription}</span>
                </div>
              </TableCell>
              <TableCell>
                {item.team ? (
                  <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700">
                    {item.team.name}
                  </Badge>
                ) : (
                  <span className="text-sm">{item.user?.name}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {item.repositoryUrl && (
                    <a href={item.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {item.demoUrl && (
                    <a href={item.demoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {item.videoUrl && (
                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-red-600">
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono font-bold text-sm">
                  {item.score !== null ? `${item.score}/100` : '-'}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={() => onReview(item.id)}>
                   Review <Eye className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const config: Record<string, { label: string; class: string; icon: any }> = {
    SUBMITTED: { label: 'Submitted', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    UNDER_REVIEW: { label: 'Reviewing', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    EVALUATED: { label: 'Evaluated', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    WINNER: { label: 'Winner', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Trophy },
    REJECTED: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  };

  const item = config[normalized] || { label: status, class: 'bg-slate-100 text-slate-700', icon: Clock };
  const Icon = item.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 font-bold px-2 py-0.5 whitespace-nowrap ${item.class}`}>
      <Icon className="h-3 w-3" />
      {item.label}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="bg-muted/50 p-4 border-b">
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
