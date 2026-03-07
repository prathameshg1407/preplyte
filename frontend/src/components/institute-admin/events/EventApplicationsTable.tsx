// src/components/institute-admin/events/EventApplicationsTable.tsx

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
  FileText, 
  Mail, 
  ExternalLink,
  Users,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy
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

interface EventApplicationsTableProps {
  items: any[];
  isLoading: boolean;
  type: 'job' | 'internship' | 'hackathon';
  onReview?: (id: string, status: string) => void;
}

export function EventApplicationsTable({ items, isLoading, type, onReview }: EventApplicationsTableProps) {
  if (isLoading) return <TableSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/10">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No {type === 'hackathon' ? 'registrations' : 'applications'} found</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          When students {type === 'hackathon' ? 'register' : 'apply'}, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Student</TableHead>
            <TableHead className="font-bold">{type === 'hackathon' ? 'Team/Role' : 'Details'}</TableHead>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-right font-bold tracking-tight">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold">{item.user?.name || 'Anonymous User'}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.user?.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {type === 'hackathon' ? (
                  <div className="flex flex-col gap-1">
                    {item.team ? (
                      <Badge variant="outline" className="w-fit gap-1 bg-indigo-50 border-indigo-200 text-indigo-700">
                        <Users className="h-3 w-3" />
                        {item.team.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit text-xs">Individual</Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {item.resumeId && (
                       <Button variant="link" className="p-0 h-auto text-xs text-primary gap-1 w-fit" asChild>
                         <a href={`/api/profile/resumes/${item.resumeId}/view`} target="_blank" rel="noopener noreferrer">
                           <FileText className="h-3 w-3" /> View Resume
                         </a>
                       </Button>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(item.appliedAt || item.registeredAt), 'MMM d, yyyy')}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                    <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg p-2.5">
                      <Eye className="h-4 w-4 text-muted-foreground" /> View Profile
                    </DropdownMenuItem>
                    {onReview && (
                      <>
                        <DropdownMenuItem 
                          className="gap-2 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer rounded-lg p-2.5 mt-1"
                          onClick={() => onReview(item.id, 'SHORTLISTED')}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive bg-destructive/5 hover:bg-destructive/10 cursor-pointer rounded-lg p-2.5 mt-1"
                          onClick={() => onReview(item.id, 'REJECTED')}
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
    APPLIED: { label: 'Applied', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    REGISTERED: { label: 'Registered', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    UNDER_REVIEW: { label: 'Reviewing', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    SHORTLISTED: { label: 'Shortlisted', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    HIRED: { label: 'Hired', class: 'bg-purple-100 text-purple-700 border-purple-200', icon: Trophy },
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
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
