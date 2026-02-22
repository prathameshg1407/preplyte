// src/app/institute-admin/events/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Job, 
  Internship, 
  Hackathon, 
  OpportunityStatus, 
  HackathonStatus,
  PaginatedResponse 
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
  Filter,
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  Users,
  Calendar
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Event Management
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Seamlessly oversee Jobs, Internships, and Hackathons across your ecosystem.
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
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
      </div>

      <Tabs defaultValue="jobs" className="space-y-8">
        <TabsList className="glass-effect p-1 bg-muted/20 border-border/50">
          <TabsTrigger value="jobs" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Briefcase className="h-4 w-4" /> Jobs
          </TabsTrigger>
          <TabsTrigger value="internships" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <GraduationCap className="h-4 w-4" /> Internships
          </TabsTrigger>
          <TabsTrigger value="hackathons" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Trophy className="h-4 w-4" /> Hackathons
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key="tabs-content"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </motion.div>
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-effect overflow-hidden border-none shadow-md">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-transparent">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No {type}s found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
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
    <motion.div 
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
      }}
      initial="hidden"
      animate="show"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            show: { opacity: 1, scale: 1 }
          }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="group relative overflow-hidden border-none shadow-lg glass-effect hover:shadow-xl transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                  {type === 'hackathon' ? (item as Hackathon).mode : (item as Job | Internship).roleTitle}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 rounded-full"
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
                      <Edit className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </div>
              <CardTitle className="scroll-m-20 text-xl font-bold tracking-tight mt-2 line-clamp-1">
                {(item as any).title}
              </CardTitle>
              <CardDescription className="line-clamp-1 italic font-medium">
                {(item as any).companyName || (item as any).tagline}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Users className="h-3.5 w-3.5" />
                   <span className="text-[11px] truncate">
                      {type === 'hackathon' ? 'Teams' : 'Vacancies'}: {(item as any).vacancies || 'Open'}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Calendar className="h-3.5 w-3.5" />
                   <span className="text-[11px] truncate">
                      {format(new Date(type === 'hackathon' ? (item as any).registrationEndDate : item.applicationDeadline), 'MMM d, yyyy')}
                   </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black",
                  item.status === 'PUBLISHED' || item.status === 'UPCOMING' 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                )}>
                  {item.status.replace('_', ' ')}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                    <Link href={`/${type === 'hackathon' ? 'hackathons' : `opportunities/${type}s`}/${item.id}`} target="_blank">
                       View Live <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="sm" className="h-8 gap-1.5 text-xs font-bold" asChild>
                    <Link href={`${basePath}/events/${type}s/${item.id}/${type === 'hackathon' ? 'registrations' : 'applications'}`}>
                       {type === 'hackathon' ? 'Registrations' : 'Applications'}
                    </Link>
                  </Button>
                  {type === 'hackathon' && (
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold border-primary/20 hover:bg-primary/5" asChild>
                      <Link href={`${basePath}/events/hackathons/${item.id}/submissions`}>
                         Submissions
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
