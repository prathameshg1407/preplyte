// src/app/institute-admin/events/jobs/[id]/edit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { 
  JobType, 
  WorkMode, 
  OpportunityStatus 
} from '@/types/event.types';
import { opportunityService } from '@/lib/api/services/opportunity.service';
import { EligibilityCriteriaField } from '@/components/institute-admin/EligibilityCriteriaField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Briefcase, 
  IndianRupee, 
  Users,
  Save,
  ArrowLeft,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const redirectPath = isAdminPath ? '/admin/events' : '/institute-admin/events';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    roleTitle: '',
    companyName: '',
    description: '',
    requirements: [] as string[],
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ON_SITE,
    location: '',
    salaryMin: 0,
    salaryMax: 0,
    vacancies: 1,
    applicationDeadline: '',
    isResumeRequired: true,
    eligibilityCriteria: {
      minCgpa: 0,
      maxBacklogs: 0,
      requiredSkills: [] as string[]
    }
  });

  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const job = await opportunityService.getJob(params.id as string);
        
        // Format date for input
        const deadline = new Date(job.applicationDeadline);
        const formattedDate = deadline.toISOString().split('T')[0];
        
        setFormData({
          roleTitle: job.roleTitle,
          companyName: job.companyName,
          description: job.description,
          requirements: job.requirements || [],
          jobType: job.jobType as JobType,
          workMode: job.workMode as WorkMode,
          location: job.location,
          salaryMin: job.salaryMin || 0,
          salaryMax: job.salaryMax || 0,
          vacancies: job.vacancies,
          applicationDeadline: formattedDate,
          isResumeRequired: job.isResumeRequired,
          eligibilityCriteria: job.eligibilityCriteria || {
            minCgpa: 0,
            maxBacklogs: 0,
            requiredSkills: []
          }
        });
      } catch (error) {
        toast({ 
          title: 'Error', 
          description: 'Failed to load job details.', 
          variant: 'destructive' 
        });
        router.push(redirectPath);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id, router, redirectPath, toast]);

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, newRequirement.trim()] });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({ 
      ...formData, 
      requirements: formData.requirements.filter((_, i) => i !== index) 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await opportunityService.updateJob(params.id as string, {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });
      
      toast({ title: 'Success', description: 'Job updated successfully!' });
      router.push(redirectPath);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update job.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-8 lg:py-12 space-y-10"
    >
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="pl-0 gap-2 hover:bg-transparent hover:text-primary group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
        <span className="font-semibold text-sm uppercase tracking-wider">Back to Dashboard</span>
      </Button>

      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Edit Job Opening
        </h1>
        <p className="text-base text-muted-foreground">
          Update job details and requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roleTitle" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Role Title</Label>
                <Input 
                  id="roleTitle" 
                  placeholder="e.g., Software Engineer" 
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Company Name</Label>
                <Input 
                  id="companyName" 
                  placeholder="e.g., Tech Corp" 
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Job Type</Label>
                <Select value={formData.jobType} onValueChange={(val: JobType) => setFormData({ ...formData, jobType: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:ring-primary/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(JobType).map(type => (
                      <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Work Mode</Label>
                <Select value={formData.workMode} onValueChange={(val: WorkMode) => setFormData({ ...formData, workMode: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:ring-primary/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WorkMode).map(mode => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Bangalore / Remote" 
                  required={formData.workMode !== WorkMode.REMOTE}
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Job Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed job responsibilities..." 
                className="min-h-[180px] bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl resize-none p-4"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Compensation */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
              Compensation & Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
             <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Salary Min (PA)</Label>
                  <Input 
                    type="number" 
                    value={formData.salaryMin}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Salary Max (PA)</Label>
                  <Input 
                    type="number" 
                    value={formData.salaryMax}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Vacancies</Label>
                  <Input 
                    type="number" 
                    value={formData.vacancies}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) || 1 })}
                  />
                </div>
             </div>

             <div className="space-y-4">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Requirements</Label>
                <div className="flex gap-2">
                   <Input 
                    placeholder="e.g., 2+ years React experience" 
                    value={newRequirement}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                   />
                   <Button type="button" variant="secondary" className="h-12 w-12 rounded-xl" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                   </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-xl border-dashed border-border/50">
                   {formData.requirements.map((req, i) => (
                     <Badge key={i} variant="secondary" className="px-3 py-1.5 gap-2 bg-background text-sm shadow-sm border-border/50">
                        {req}
                        <X className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => removeRequirement(i)} />
                     </Badge>
                   ))}
                   {formData.requirements.length === 0 && (
                     <span className="text-xs text-muted-foreground italic pl-2 pt-1">No specific requirements added.</span>
                   )}
                </div>
             </div>

             <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Application Deadline</Label>
                <Input 
                  type="date" 
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                />
             </div>
          </CardContent>
        </Card>

        {/* Eligibility Section */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-violet-500" />
              </div>
              Eligibility Criteria
            </CardTitle>
            <CardDescription className="italic pl-13">Set high-fidelity filters to automate candidate screening.</CardDescription>
          </CardHeader>
          <CardContent>
             <EligibilityCriteriaField 
                value={formData.eligibilityCriteria}
                onChange={(criteria) => setFormData({ ...formData, eligibilityCriteria: criteria as any })}
             />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-8">
          <Button 
            type="button" 
            variant="ghost" 
            className="h-12 px-8 font-bold text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="h-12 px-10 font-black gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105" 
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Update Job
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
