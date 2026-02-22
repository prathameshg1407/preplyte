// src/app/opportunities/jobs/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Job, 
  OpportunityStatus, 
  ApplicationStatus 
} from '@/types/event.types';
import { opportunityService } from '@/lib/api/services/opportunity.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons?: string[] } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [userApplication, setUserApplication] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobData, eligibilityData] = await Promise.all([
          opportunityService.getJob(id as string),
          opportunityService.checkJobEligibility(id as string)
        ]);
        setJob(jobData);
        setUserApplication(jobData.userApplication || null);
        setEligibility(eligibilityData);
      } catch (error) {
        console.error('Failed to fetch job details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, toast]);

  const handleApply = async () => {
    if (!eligibility?.eligible) {
      toast({
        title: 'Not Eligible',
        description: 'You do not meet the eligibility criteria for this job.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsApplying(true);
      // For now, just a direct application call
      // In a real flow, this might open a dialog for resume selection
      const application = await opportunityService.applyForJob(id as string, { resumeId: 'default' });
      
      // Update the userApplication state
      setUserApplication(application);
      
      toast({
        title: 'Success!',
        description: 'Your application has been submitted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const deadline = new Date(job.applicationDeadline);
  const isExpired = deadline < new Date();

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 gap-2 hover:bg-transparent hover:text-primary pl-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 text-sm capitalize">
                {job.jobType.replace('_', ' ').toLowerCase()}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm capitalize">
                {job.workMode.toLowerCase()}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{job.roleTitle}</h1>
            <div className="flex items-center gap-4 text-lg font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {job.companyName}
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {job.location}
              </div>
            </div>
          </section>

          <Card className="border-none shadow-none bg-muted/30">
            <CardContent className="p-6 grid gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Salary Range</p>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  {(job.salaryMin || 0) / 100000}L - {(job.salaryMax || 0) / 100000}L PA
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vacancies</p>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Users className="h-5 w-5 text-primary" />
                  {job.vacancies} Positions
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</p>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Clock className="h-5 w-5 text-orange-500" />
                  {format(deadline, 'MMM d, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Job Description</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              {job.description}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Key Requirements</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium">{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="sticky top-24 border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Ready to apply?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your profile is complete before submitting.
                </p>
              </div>

              {eligibility && (
                <div className={cn(
                  "rounded-xl p-4 flex gap-3",
                  eligibility.eligible ? "bg-emerald-500/10" : "bg-destructive/10"
                )}>
                  {eligibility.eligible ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <div className="space-y-1">
                    <p className={cn(
                      "text-sm font-bold",
                      eligibility.eligible ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
                    )}>
                      {eligibility.eligible ? 'You are eligible!' : 'Eligibility Check Failed'}
                    </p>
                    {!eligibility.eligible && eligibility.reasons?.map((reason, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {reason}</p>
                    ))}
                  </div>
                </div>
              )}

              {userApplication && (
                <div className="rounded-xl p-4 flex gap-3 bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      Application Submitted
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied on {format(new Date(userApplication.appliedAt), 'MMM d, yyyy')}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {userApplication.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-12 text-lg font-bold gap-2" 
                disabled={isApplying || isExpired || !eligibility?.eligible || !!userApplication}
                onClick={handleApply}
                variant={userApplication ? "secondary" : "default"}
              >
                {userApplication ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Already Applied
                  </>
                ) : isApplying ? (
                  'Applying...'
                ) : isExpired ? (
                  'Deadline Passed'
                ) : (
                  'Apply Now'
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  By clicking Apply, you agree to share your profile details with {job.companyName}.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="p-6 space-y-4">
              <h4 className="font-bold">Quick Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-semibold">{format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Job ID</span>
                  <span className="font-semibold uppercase">{job.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">Technology</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
