// src/app/institute-admin/events/hackathons/[id]/edit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { 
  HackathonStatus, 
  HackathonMode, 
  ParticipationType 
} from '@/types/event.types';
import { hackathonService } from '@/lib/api/services/hackathon.service';
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
  Trophy, 
  Calendar, 
  Users, 
  Save, 
  ArrowLeft, 
  Plus, 
  X,
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function EditHackathonPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const redirectPath = isAdminPath ? '/admin/events' : '/institute-admin/events';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    rules: '',
    themes: [] as string[],
    mode: HackathonMode.ONLINE,
    participationType: ParticipationType.BOTH,
    minTeamSize: 1,
    maxTeamSize: 4,
    registrationStartDate: '',
    registrationEndDate: '',
    eventStartDate: '',
    eventEndDate: '',
    submissionDeadline: '',
    resultsDate: '',
    isResumeRequired: true,
  });

  const [newTheme, setNewTheme] = useState('');

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const hackathon = await hackathonService.getHackathon(params.id as string);
        
        // Format dates for input
        const formatDate = (date: string) => {
          const d = new Date(date);
          return d.toISOString().slice(0, 16);
        };
        
        setFormData({
          title: hackathon.title,
          tagline: hackathon.tagline || '',
          description: hackathon.description,
          rules: hackathon.rules || '',
          themes: hackathon.themes || [],
          mode: hackathon.mode as HackathonMode,
          participationType: hackathon.participationType as ParticipationType,
          minTeamSize: hackathon.minTeamSize,
          maxTeamSize: hackathon.maxTeamSize,
          registrationStartDate: formatDate(hackathon.registrationStartDate),
          registrationEndDate: formatDate(hackathon.registrationEndDate),
          eventStartDate: formatDate(hackathon.eventStartDate),
          eventEndDate: formatDate(hackathon.eventEndDate),
          submissionDeadline: formatDate(hackathon.submissionDeadline),
          resultsDate: hackathon.resultsDate ? formatDate(hackathon.resultsDate) : '',
          isResumeRequired: hackathon.isResumeRequired,
        });
      } catch (error) {
        toast({ 
          title: 'Error', 
          description: 'Failed to load hackathon details.', 
          variant: 'destructive' 
        });
        router.push(redirectPath);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHackathon();
    }
  }, [params.id, router, redirectPath, toast]);

  const addTheme = () => {
    if (newTheme.trim() && !formData.themes.includes(newTheme.trim())) {
      setFormData({ ...formData, themes: [...formData.themes, newTheme.trim()] });
      setNewTheme('');
    }
  };

  const removeTheme = (theme: string) => {
    setFormData({ ...formData, themes: formData.themes.filter(t => t !== theme) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await hackathonService.updateHackathon(params.id as string, {
        ...formData,
        registrationStartDate: new Date(formData.registrationStartDate).toISOString(),
        registrationEndDate: new Date(formData.registrationEndDate).toISOString(),
        eventStartDate: new Date(formData.eventStartDate).toISOString(),
        eventEndDate: new Date(formData.eventEndDate).toISOString(),
        submissionDeadline: new Date(formData.submissionDeadline).toISOString(),
        resultsDate: formData.resultsDate ? new Date(formData.resultsDate).toISOString() : undefined
      });
      
      toast({ title: 'Success', description: 'Hackathon updated successfully!' });
      router.push(redirectPath);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update hackathon.', variant: 'destructive' });
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
      className="max-w-5xl mx-auto py-8 lg:py-12 space-y-10"
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
          Edit Hackathon
        </h1>
        <p className="text-base text-muted-foreground">
          Update hackathon details and settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              Event Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Hackathon Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Build-a-Thon 2024" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-14 text-xl font-bold bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl px-6 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline" className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Tagline</Label>
                <Input 
                  id="tagline" 
                  placeholder="One sentence that captures the essence" 
                  value={formData.tagline}
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
               <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Participation Type</Label>
                  <Select value={formData.participationType} onValueChange={(val: ParticipationType) => setFormData({ ...formData, participationType: val })}>
                    <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:ring-primary/20 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ParticipationType).map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Event Mode</Label>
                  <Select value={formData.mode} onValueChange={(val: HackathonMode) => setFormData({ ...formData, mode: val })}>
                    <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:ring-primary/20 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(HackathonMode).map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-3">
               <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Themes / Tracks</Label>
               <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., AI/ML, Fintech, Web3" 
                    value={newTheme}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                    onChange={(e) => setNewTheme(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                  />
                  <Button type="button" variant="secondary" className="h-12 w-12 rounded-xl" onClick={addTheme}><Plus className="h-4 w-4" /></Button>
               </div>
               <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-xl border-dashed border-border/50">
                  {formData.themes.map(theme => (
                    <Badge key={theme} className="px-3 py-1.5 gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-lg font-bold text-xs shadow-sm">
                      {theme}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTheme(theme)} />
                    </Badge>
                  ))}
                  {formData.themes.length === 0 && (
                    <span className="text-xs text-muted-foreground italic pl-2 pt-1">No themes added.</span>
                  )}
               </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Description</Label>
              <Textarea 
                placeholder="What is this hackathon about?" 
                className="min-h-[180px] bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl resize-none p-4"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timelines */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-emerald-500" />
              </div>
              Timelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
             <div className="grid gap-10 sm:grid-cols-2">
                <div className="space-y-6">
                   <div className="flex items-center gap-2 px-1">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Registration Phase</Label>
                   </div>
                   <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Start Date</Label>
                        <Input type="datetime-local" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" required value={formData.registrationStartDate} onChange={(e) => setFormData({...formData, registrationStartDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">End Date</Label>
                        <Input type="datetime-local" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" required value={formData.registrationEndDate} onChange={(e) => setFormData({...formData, registrationEndDate: e.target.value})} />
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-2 px-1">
                      <Trophy className="h-4 w-4 text-emerald-500" />
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Hackathon Period</Label>
                   </div>
                   <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Start Date</Label>
                        <Input type="datetime-local" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" required value={formData.eventStartDate} onChange={(e) => setFormData({...formData, eventStartDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">End Date</Label>
                        <Input type="datetime-local" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" required value={formData.eventEndDate} onChange={(e) => setFormData({...formData, eventEndDate: e.target.value})} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid gap-10 sm:grid-cols-2 pt-6 border-t border-border/50">
                <div className="space-y-2">
                   <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Submission Deadline</Label>
                   <Input type="datetime-local" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" required value={formData.submissionDeadline} onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Results Date (Optional)</Label>
                   <Input type="datetime-local" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" value={formData.resultsDate} onChange={(e) => setFormData({...formData, resultsDate: e.target.value})} />
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card className="border-none shadow-xl glass-effect overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              Team Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 grid-cols-2">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Min Team Size</Label>
                <Input type="number" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" min="1" value={formData.minTeamSize} onChange={(e) => setFormData({...formData, minTeamSize: parseInt(e.target.value) || 1})} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">Max Team Size</Label>
                <Input type="number" className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl" min="1" value={formData.maxTeamSize} onChange={(e) => setFormData({...formData, maxTeamSize: parseInt(e.target.value) || 1})} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic pl-1">
              Solo participation? Set Min Size to 1.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-6 pt-10">
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
            className="h-12 px-12 font-black gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105" 
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
                Update Hackathon
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
