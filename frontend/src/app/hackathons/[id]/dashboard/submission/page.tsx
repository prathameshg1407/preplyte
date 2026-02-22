// src/app/hackathons/[id]/dashboard/submission/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Hackathon,
  HackathonStatus
} from '@/types/event.types';
import { hackathonService } from '@/lib/api/services/hackathon.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  X, 
  Github, 
  Globe, 
  Video, 
  FileText,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function HackathonSubmissionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  
  // Form State
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackathonData, regData] = await Promise.all([
          hackathonService.getHackathon(id as string),
          hackathonService.getRegistrationStatus(id as string)
        ]);
        
        if (!regData.isRegistered) {
          router.push(`/hackathons/${id}`);
          return;
        }

        if (hackathonData.status !== HackathonStatus.SUBMISSION_OPEN && hackathonData.status !== HackathonStatus.ONGOING) {
           toast({
             title: 'Submission Closed',
             description: 'Project submission is not currently open for this hackathon.',
             variant: 'destructive',
           });
           router.push(`/hackathons/${id}/dashboard`);
           return;
        }

        setHackathon(hackathonData);
        setRegistration(regData.registration);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load submission data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router, toast]);

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTech.trim()) {
      e.preventDefault();
      if (!techStack.includes(currentTech.trim())) {
        setTechStack([...techStack, currentTech.trim()]);
      }
      setCurrentTech('');
    }
  };

  const removeTech = (item: string) => {
    setTechStack(techStack.filter(t => t !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !projectDescription || !repositoryUrl || techStack.length === 0) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields and add at least one technology.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await hackathonService.submitProject({
        hackathonId: id as string,
        teamId: registration.teamId || undefined,
        projectName,
        projectDescription,
        techStack,
        repositoryUrl,
        demoUrl: demoUrl || undefined,
        videoUrl: videoUrl || undefined,
        presentationUrl: presentationUrl || undefined,
      });

      toast({
        title: 'Success!',
        description: 'Your project has been submitted successfully.',
      });
      
      router.push(`/hackathons/${id}/dashboard`);
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Failed to submit project.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SubmissionSkeleton />;
  if (!hackathon) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <Link href={`/hackathons/${id}/dashboard`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit Your Project</h1>
        <p className="text-muted-foreground">Tell us what you&apos;ve built during {hackathon.title}.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Required details about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name <span className="text-destructive">*</span></Label>
              <Input 
                id="projectName" 
                placeholder="e.g. Preplyte AI Tutor" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea 
                id="description" 
                placeholder="What does your project do? What problem does it solve?" 
                className="min-h-[150px] resize-none"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
              />
              <p className="text-[10px] text-muted-foreground">Minimum 20 characters recommended.</p>
            </div>

            <div className="space-y-3">
              <Label>Tech Stack <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2 mb-2">
                <AnimatePresence>
                  {techStack.map((tech) => (
                    <motion.div
                      key={tech}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {tech}
                        <button 
                          type="button" 
                          onClick={() => removeTech(tech)}
                          className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Next.js (Press Enter to add)" 
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  onKeyDown={handleAddTech}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Links</CardTitle>
            <CardDescription>Where can we find your work?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="repo">Repository URL <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="repo" 
                  className="pl-9" 
                  placeholder="https://github.com/your-username/repo" 
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demo">Live Demo URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="demo" 
                    className="pl-9" 
                    placeholder="https://yourproject.com" 
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Demo Video URL</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="video" 
                    className="pl-9" 
                    placeholder="https://youtube.com/..." 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation">Presentation/Slides URL</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="presentation" 
                  className="pl-9" 
                  placeholder="https://slides.google.com/..." 
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Double check your links! Judges won&apos;t be able to evaluate your project if the repository or demo is inaccessible.
          </p>
        </div>

        <Button type="submit" className="w-full py-6 text-lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Complete Submission'
          )}
        </Button>
      </form>
    </div>
  );
}

function SubmissionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-[400px] w-full" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}
