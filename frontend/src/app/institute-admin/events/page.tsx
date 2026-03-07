// src/app/institute-admin/events/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Job, 
  Internship, 
  Hackathon, 
} from '@/types/event.types';
import { opportunityService } from '@/lib/api/services/opportunity.service';
import { hackathonService } from '@/lib/api/services/hackathon.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  Search, 
  ExternalLink,
  Edit,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AdminEventsPage({ basePath = '/institute-admin' }: { basePath?: string }) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, internshipsRes, hackathonsRes] = await Promise.all([
          opportunityService.listJobs({ limit: 10 }),
          opportunityService.listInternships({ limit: 10 }),
          hackathonService.listHackathons({ limit: 10 })
        ]);
        setJobs(jobsRes.data);
        setInternships(internshipsRes.data);
        setHackathons(hackathonsRes.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header (Matched to Base Branch) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Event Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seamlessly oversee Jobs, Internships, and Hackathons across your ecosystem.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/events/jobs/new`} className="flex gap-2 items-center">
                <Briefcase className="h-4 w-4" /> Job Opening
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/events/internships/new`} className="flex gap-2 items-center">
                <GraduationCap className="h-4 w-4" /> Internship
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/events/hackathons/new`} className="flex gap-2 items-center">
                <Trophy className="h-4 w-4" /> Hackathon
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" /> Jobs
          </TabsTrigger>
          <TabsTrigger value="internships" className="gap-2">
            <GraduationCap className="h-4 w-4" /> Internships
          </TabsTrigger>
          <TabsTrigger value="hackathons" className="gap-2">
            <Trophy className="h-4 w-4" /> Hackathons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-0 outline-none">
          <EventTable 
            loading={loading} 
            items={jobs} 
            type="job"
            createHref={`${basePath}/events/jobs/new`}
            basePath={basePath}
            router={router}
          />
        </TabsContent>

        <TabsContent value="internships" className="mt-0 outline-none">
          <EventTable 
            loading={loading} 
            items={internships} 
            type="internship"
            createHref={`${basePath}/events/internships/new`}
            basePath={basePath}
            router={router}
          />
        </TabsContent>

        <TabsContent value="hackathons" className="mt-0 outline-none">
          <EventTable 
            loading={loading} 
            items={hackathons} 
            type="hackathon"
            createHref={`${basePath}/events/hackathons/new`}
            basePath={basePath}
            router={router}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventTable({ loading, items, type, createHref, basePath, router }: { 
  loading: boolean; 
  items: any[]; 
  type: 'job' | 'internship' | 'hackathon';
  createHref: string;
  basePath: string;
  router: any;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No {type}s found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mt-1">
          You haven't created any {type} events yet. Start by posting a new opportunity.
        </p>
        <Button asChild>
          <Link href={createHref}>
            <Plus className="h-4 w-4 mr-2" /> Create {type.charAt(0).toUpperCase() + type.slice(1)}
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                {type === 'hackathon' ? (item as Hackathon).mode : (item as Job | Internship).roleTitle}
              </Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 rounded-md"
                   onClick={() => {
                     const editPath = type === 'hackathon' 
                       ? `${basePath}/events/hackathons/${item.id}/edit`
                       : type === 'job'
                       ? `${basePath}/events/jobs/${item.id}/edit`
                       : `${basePath}/events/internships/${item.id}/edit`;
                     router.push(editPath);
                   }}
                   title="Edit"
                 >
                    <Edit className="h-4 w-4" />
                 </Button>
              </div>
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight mt-2 line-clamp-1">
              {(item as any).title}
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {(item as any).companyName || (item as any).tagline}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <Users className="h-4 w-4" />
                 <span className="text-xs truncate">
                    {type === 'hackathon' ? 'Teams' : 'Vacancies'}: {(item as any).vacancies || 'Open'}
                 </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                 <Calendar className="h-4 w-4" />
                 <span className="text-xs truncate">
                    {format(new Date(type === 'hackathon' ? (item as any).registrationEndDate : item.applicationDeadline), 'MMM d, yyyy')}
                 </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Badge className={cn(
                "w-fit",
                item.status === 'PUBLISHED' || item.status === 'UPCOMING' 
                  ? "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}>
                {item.status.replace('_', ' ')}
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link href={`/${type === 'hackathon' ? 'hackathons' : `opportunities/${type}s`}/${item.id}`} target="_blank">
                     Live <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" className="h-8 text-xs" asChild>
                  <Link href={`${basePath}/events/${type}s/${item.id}/${type === 'hackathon' ? 'registrations' : 'applications'}`}>
                     {type === 'hackathon' ? 'Registrations' : 'Applications'}
                  </Link>
                </Button>
                {type === 'hackathon' && (
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link href={`${basePath}/events/hackathons/${item.id}/submissions`}>
                       Submissions
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}