// src/app/institute-admin/events/jobs/[id]/applications/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { opportunityService } from '@/lib/api/services/opportunity.service';
import { EventApplicationsTable } from '@/components/institute-admin/events/EventApplicationsTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Briefcase, Download } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function JobApplicationsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobData, appData] = await Promise.all([
          opportunityService.getJob(id as string),
          opportunityService.listJobApplications({ jobId: id as string })
        ]);
        setJob(jobData);
        setApplications(appData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load applications.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, toast]);

  const handleReview = async (applicationId: string, status: string) => {
    try {
      await opportunityService.reviewJobApplication(applicationId, { status });
      toast({
        title: 'Success',
        description: `Application status updated to ${status}.`,
      });
      // Refresh applications
      const appData = await opportunityService.listJobApplications({ jobId: id as string });
      setApplications(appData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href="/institute-admin/events" 
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Applications
            </h1>
            {job && (
              <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <Briefcase className="h-3.5 w-3.5" />
                {job.roleTitle}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Review and manage all student applications for this job opening.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <EventApplicationsTable 
        items={applications} 
        isLoading={loading} 
        type="job" 
        onReview={handleReview}
      />
    </div>
  );
}
