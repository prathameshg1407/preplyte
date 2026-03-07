// src/app/institute-admin/events/hackathons/[id]/submissions/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hackathonService } from '@/lib/api/services/hackathon.service';
import { AdminSubmissionReviewTable } from '@/components/institute-admin/events/AdminSubmissionReviewTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, Download, Search } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { SubmissionReviewDialog } from '@/components/institute-admin/events/SubmissionReviewDialog';

export default function HackathonSubmissionsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [hackathon, setHackathon] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackathonData, subData] = await Promise.all([
          hackathonService.getHackathon(id as string),
          hackathonService.listSubmissions(id as string)
        ]);
        setHackathon(hackathonData);
        setSubmissions(subData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load submissions.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, toast]);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const handleReview = (id: string) => {
    const submission = submissions.find(s => s.id === id);
    if (submission) {
      setSelectedSubmission(submission);
      setReviewDialogOpen(true);
    }
  };

  const handleSubmitReview = async (score: number, feedback: string) => {
    if (!selectedSubmission) return;
    
    try {
      await hackathonService.reviewSubmission(selectedSubmission.id, { score, feedback });
      toast({
        title: 'Review Saved',
        description: `Successfully reviewed ${selectedSubmission.projectName}.`,
      });
      // Refresh submissions
      const subData = await hackathonService.listSubmissions(id as string);
      setSubmissions(subData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save review.',
        variant: 'destructive',
      });
      throw error;
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
              Project Submissions
            </h1>
            {hackathon && (
              <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                <Trophy className="h-3.5 w-3.5" />
                {hackathon.title}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Evaluate and score projects submitted by teams.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export Results
            </Button>
        </div>
      </div>

      <AdminSubmissionReviewTable 
        items={submissions} 
        isLoading={loading} 
        onReview={handleReview}
      />

      {selectedSubmission && (
        <SubmissionReviewDialog 
          isOpen={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          onSubmit={handleSubmitReview}
          projectName={selectedSubmission.projectName}
          initialScore={selectedSubmission.score || 0}
          initialFeedback={selectedSubmission.feedback || ''}
        />
      )}
    </div>
  );
}
