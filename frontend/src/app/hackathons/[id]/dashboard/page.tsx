// src/app/hackathons/[id]/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Hackathon,
  ParticipationType,
  HackathonStatus
} from '@/types/event.types';
import { hackathonService } from '@/lib/api/services/hackathon.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Trophy, 
  Users, 
  User, 
  ArrowRight, 
  Settings, 
  ExternalLink,
  MessageSquare,
  FileCode2,
  Calendar,
  Clock,
  Layout
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Plus, UserPlus, LogOut, Check } from 'lucide-react';

export default function HackathonParticipantDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  
  // Team Actions State
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hackathonData, regData] = await Promise.all([
        hackathonService.getHackathon(id as string),
        hackathonService.getRegistrationStatus(id as string)
      ]);
      
      if (!regData.isRegistered) {
        toast({
          title: 'Not Registered',
          description: 'You need to register for this hackathon first.',
          variant: 'destructive',
        });
        router.push(`/hackathons/${id}`);
        return;
      }

      setHackathon(hackathonData);
      setRegistration(regData.registration);

      if (regData.registration.teamId) {
        const teamData = await hackathonService.getTeam(regData.registration.teamId);
        setTeam(teamData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, router, toast]);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    try {
      setIsActionLoading(true);
      await hackathonService.createTeam({ hackathonId: id as string, teamName });
      toast({ title: 'Success', description: 'Team created successfully!' });
      setIsTeamDialogOpen(false);
      fetchData(); // Refresh
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create team.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return;
    try {
      setIsActionLoading(true);
      await hackathonService.joinTeam({ hackathonId: id as string, inviteCode });
      toast({ title: 'Success', description: 'Joined team successfully!' });
      setIsJoinDialogOpen(false);
      fetchData(); // Refresh
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to join team.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied', description: 'Invite code copied to clipboard.' });
  };

  if (loading) return <DashboardSkeleton />;
  if (!hackathon || !registration) return null;

  const isSubmissionOpen = hackathon.status === HackathonStatus.SUBMISSION_OPEN;
  const canManageTeam = hackathon.participationType === ParticipationType.TEAM;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/hackathons/${id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
              <Layout className="h-4 w-4" />
              Main Page
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{hackathon.title} Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your participation and submit your project.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="secondary" className="px-3 py-1 uppercase tracking-wider font-bold text-[10px]">
             {hackathon.status.replace(/_/g, ' ')}
           </Badge>
           {isSubmissionOpen && (
             <Button asChild className="shadow-lg shadow-primary/20">
               <Link href={`/hackathons/${id}/dashboard/submission`}>
                 <FileCode2 className="mr-2 h-4 w-4" />
                 Submit Project
               </Link>
             </Button>
           )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Team & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Team Info Card */}
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div>
                <CardTitle className="text-2xl">Team Details</CardTitle>
                <CardDescription>Members and collaboration info</CardDescription>
              </div>
              {team && (
                <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground px-2">Invite Code</span>
                  <Badge variant="outline" className="font-mono text-sm bg-background border-none px-3 py-1 shadow-sm">
                    {team.inviteCode}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(team.inviteCode)}>
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-8">
              {team ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 shadow-inner flex items-center justify-center">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold tracking-tight">{team.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold uppercase tracking-wider">
                           {team.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">• {team.members?.length || 0} Members</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <h5 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Team Members</h5>
                    {team.members?.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center border shadow-sm">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{member.user?.name}</span>
                            <span className="text-xs text-muted-foreground">{member.user?.email}</span>
                          </div>
                        </div>
                        <Badge variant={member.role === 'LEADER' ? 'default' : 'secondary'} className="text-[10px] font-bold uppercase tracking-tighter">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                  <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center rotate-3 border-2 border-dashed border-primary/30">
                    <Users className="h-10 w-10 text-primary/40 -rotate-3" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <p className="text-xl font-bold">Collaborate to Innovate</p>
                    <p className="text-sm text-muted-foreground">
                      {canManageTeam 
                        ? "This hackathon encourages teams. Create one or join your friends!"
                        : "Solo mode: You're ready to tackle this challenge on your own."}
                    </p>
                  </div>
                  {canManageTeam && (
                    <div className="flex gap-3 mt-2">
                       <Button onClick={() => setIsTeamDialogOpen(true)} className="gap-2 rounded-xl">
                          <Plus className="h-4 w-4" /> Create Team
                       </Button>
                       <Button onClick={() => setIsJoinDialogOpen(true)} variant="outline" className="gap-2 rounded-xl">
                          <UserPlus className="h-4 w-4" /> Join Team
                       </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Status */}
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b pb-6">
              <CardTitle className="text-2xl">Project Submission</CardTitle>
              <CardDescription>Track and update your project status</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {team?.submission?.status === 'SUBMITTED' ? (
                 <div className="p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 text-center space-y-6">
                    <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                       <Check className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold text-emerald-700">Project Submitted!</h3>
                       <p className="text-emerald-600/80 text-sm italic">"{team.submission.projectName}"</p>
                       <p className="text-muted-foreground text-sm max-w-xs mx-auto">You can still edit your submission until the deadline.</p>
                    </div>
                    {isSubmissionOpen && (
                      <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        <Link href={`/hackathons/${id}/dashboard/submission`}>
                           Edit Submission
                        </Link>
                      </Button>
                    )}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6 border-2 border-dashed rounded-3xl bg-muted/10 transition-all hover:bg-muted/20">
                  <div className="h-24 w-24 rounded-full bg-background shadow-inner flex items-center justify-center">
                    <FileCode2 className="h-10 w-10 text-muted-foreground animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Ready to submit?</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
                      {isSubmissionOpen 
                        ? "The window is open! Tell us about the amazing project you've built."
                        : "Focus on building! Submission window opens when the hacking begins."}
                    </p>
                  </div>
                  {isSubmissionOpen && (
                    <Button asChild className="rounded-xl px-8 shadow-lg shadow-primary/20">
                      <Link href={`/hackathons/${id}/dashboard/submission`}>
                        Start Submission <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Resources */}
        <div className="space-y-8">
          {/* Important Dates */}
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TimelineItem 
                icon={Calendar} 
                label="Launch" 
                date={new Date(hackathon.eventStartDate).toLocaleDateString()} 
                time={new Date(hackathon.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <TimelineItem 
                icon={Clock} 
                label="Submission End" 
                date={new Date(hackathon.submissionDeadline).toLocaleDateString()}
                time={new Date(hackathon.submissionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                isHighlight
              />
              <TimelineItem 
                icon={Trophy} 
                label="Grand Finale" 
                date={hackathon.resultsDate ? new Date(hackathon.resultsDate).toLocaleDateString() : 'TBA'} 
              />
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-between bg-white dark:bg-zinc-950 rounded-xl" asChild>
                <a href={hackathon.websiteUrl || '#'} target="_blank" rel="noopener noreferrer">
                  <span>Portal Website</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Need help? Join the <span className="text-primary font-bold">Discord</span> channel for mentor support and real-time announcements.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create a New Team</DialogTitle>
            <DialogDescription>
              Name your squad! You'll get an invite code to share with your friends.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold">Team Name</Label>
              <Input
                id="name"
                placeholder="e.g. Dream Team 2024"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTeam} disabled={isActionLoading} className="rounded-xl w-full">
              {isActionLoading ? 'Creating...' : 'Launch Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Team Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Join a Team</DialogTitle>
            <DialogDescription>
              Got an invite code? Enter it below to join your teammates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-bold">Invite Code</Label>
              <Input
                id="code"
                placeholder="Paste code here..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="rounded-xl h-11 font-mono uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleJoinTeam} disabled={isActionLoading} className="rounded-xl w-full">
              {isActionLoading ? 'Joining...' : 'Enter Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimelineItem({ icon: Icon, label, date, time, isHighlight = false }: any) {
  return (
    <div className="flex gap-4 group">
      <div className={`mt-1 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${isHighlight ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col justify-center">
        <p className={`text-sm font-bold tracking-tight ${isHighlight ? 'text-primary' : ''}`}>{label}</p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
           {date} {time && <span className="text-muted-foreground/50">• {time}</span>}
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-4 w-1/4 rounded-lg" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[250px] w-full rounded-2xl" />
          <Skeleton className="h-[350px] w-full rounded-2xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[300px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
