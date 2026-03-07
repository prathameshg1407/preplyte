// src/app/opportunities/internships/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Internship 
} from '@/types/event.types';
import { opportunityService } from '@/lib/api/services/opportunity.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons?: string[] } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [userApplication, setUserApplication] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, eligibilityData] = await Promise.all([
          opportunityService.getInternship(id as string),
          opportunityService.checkInternshipEligibility(id as string)
        ]);
        setInternship(data);
        setUserApplication(data.userApplication || null);
        setEligibility(eligibilityData);
      } catch (error) {
        console.error('Failed to fetch internship details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load internship details.',
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
        description: 'You do not meet the eligibility criteria for this internship.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsApplying(true);
      const application = await opportunityService.applyForInternship(id as string, { resumeId: 'default' });
      
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
          </div>
        </div>
      </div>
    );
  }

  if (!internship) return null;

  const deadline = new Date(internship.applicationDeadline);
  const isExpired = deadline < new Date();

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 gap-2 hover:bg-transparent hover:text-primary pl-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Internships
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 text-sm">Internship</Badge>
              {internship.isPpo && (
                <Badge className="bg-emerald-500 text-white border-none gap-1">
                  <Zap className="h-3 w-3" />
                  PPO Included
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{internship.roleTitle}</h1>
            <div className="flex items-center gap-4 text-lg font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {internship.companyName}
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {internship.location}
              </div>
            </div>
          </section>

          <Card className="border-none shadow-none bg-muted/30">
            <CardContent className="p-6 grid gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stipend</p>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  {internship.stipendMin} - {internship.stipendMax} /mo
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</p>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Calendar className="h-5 w-5 text-primary" />
                  {internship.duration} Months
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
            <h2 className="text-2xl font-bold">Internship Description</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              {internship.description}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Requirements</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {internship.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium">{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Apply for Internship</h3>
                <p className="text-sm text-muted-foreground">
                  Applications are open for this role.
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
