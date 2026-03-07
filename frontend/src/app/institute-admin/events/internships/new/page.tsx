// src/app/institute-admin/events/internships/new/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  OpportunityStatus 
} from '@/types/event.types';
import { opportunityService } from '@/lib/api/services/opportunity.service';
import { EligibilityCriteriaField } from '@/components/institute-admin/EligibilityCriteriaField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Building2, 
  IndianRupee, 
  Calendar, 
  Users,
  Save,
  ArrowLeft,
  X,
  Plus,
  Clock,
  Zap,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function CreateInternshipPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const redirectPath = isAdminPath ? '/admin/events' : '/institute-admin/events';
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    roleTitle: '',
    companyName: '',
    description: '',
    requirements: [] as string[],
    internshipType: 'SEMESTER' as 'SUMMER' | 'WINTER' | 'SEMESTER' | 'PART_TIME' | 'FLEXIBLE',
    durationValue: 6,
    durationType: 'MONTHS' as 'WEEKS' | 'MONTHS',
    workMode: 'HYBRID' as 'HYBRID' | 'ON_SITE' | 'REMOTE',
    stipendMin: 0,
    stipendMax: 0,
    vacancies: 1,
    isPpo: false,
    location: '',
    applicationDeadline: '',
    isResumeRequired: true,
    eligibilityCriteria: {
      minCgpa: 0,
      maxBacklogs: 0,
      requiredSkills: [] as string[]
    }
  });

  const [newRequirement, setNewRequirement] = useState('');

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
      await opportunityService.createInternship({
        ...formData,
        status: OpportunityStatus.PUBLISHED,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });
      toast({ title: 'Success', description: 'Internship opportunity created successfully!' });
      router.push(redirectPath);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create internship.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

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
          Post Internship
        </h1>
        <p className="text-base text-muted-foreground">
          Launch a new internship program and nurture the next generation of talent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              Program Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roleTitle" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Internship Role</Label>
                <Input 
                  id="roleTitle" 
                  placeholder="e.g., Frontend Intern" 
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Company</Label>
                <Input 
                  id="companyName" 
                  placeholder="e.g., Startup X" 
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="internshipType" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Internship Type</Label>
                <select
                  id="internshipType"
                  required
                  className="h-12 w-full bg-background/50 border border-border/50 focus:border-primary/50 transition-all rounded-xl px-3"
                  value={formData.internshipType}
                  onChange={(e) => setFormData({ ...formData, internshipType: e.target.value as any })}
                >
                  <option value="SEMESTER">Semester</option>
                  <option value="SUMMER">Summer</option>
                  <option value="WINTER">Winter</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="FLEXIBLE">Flexible</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workMode" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Work Mode</Label>
                <select
                  id="workMode"
                  required
                  className="h-12 w-full bg-background/50 border border-border/50 focus:border-primary/50 transition-all rounded-xl px-3"
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                >
                  <option value="HYBRID">Hybrid</option>
                  <option value="ON_SITE">On Site</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
               <div className="space-y-2">
                <Label htmlFor="location" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Remote / Office" 
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 pt-8">
                 <Checkbox 
                  id="isPpo" 
                  checked={formData.isPpo} 
                  onCheckedChange={(checked) => setFormData({ ...formData, isPpo: checked as boolean })}
                 />
                 <Label htmlFor="isPpo" className="flex items-center gap-2 cursor-pointer font-black text-sm text-foreground/80">
                    <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500/20 animate-pulse" />
                    PPO Included
                 </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Internship Description</Label>
              <Textarea 
                id="description" 
                placeholder="What will the intern work on?" 
                className="min-h-[180px] bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl resize-none p-4"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Duration */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
              Requirements & Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
             <div className="grid gap-6 sm:grid-cols-4">
                <div className="space-y-2 col-span-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Duration</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={formData.durationValue}
                      className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                      onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) || 6 })}
                    />
                    <select
                      className="h-12 bg-background/50 border border-border/50 focus:border-primary/50 transition-all rounded-xl px-3"
                      value={formData.durationType}
                      onChange={(e) => setFormData({ ...formData, durationType: e.target.value as any })}
                    >
                      <option value="WEEKS">Weeks</option>
                      <option value="MONTHS">Months</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Min Stipend (/mo)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    max="999999"
                    value={formData.stipendMin}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, stipendMin: Math.min(value, 999999) });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Max Stipend (/mo)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    max="999999"
                    value={formData.stipendMax}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, stipendMax: Math.min(value, 999999) });
                    }}
                  />
                </div>
             </div>

             <div className="space-y-4">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Required Skills</Label>
                <div className="flex gap-2">
                   <Input 
                    placeholder="e.g., HTML, CSS, JavaScript" 
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
              Eligibility
            </CardTitle>
            <CardDescription className="italic pl-13">Filter candidates with precision for this internship.</CardDescription>
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
                Publishing...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Post Internship
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
