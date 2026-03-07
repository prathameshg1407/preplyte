// src/app/hackathons/[id]/register/page.tsx

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Trophy, 
  Users, 
  User, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function HackathonRegistrationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [step, setStep] = useState(1); // 1: Choose Mode, 2: Mode Specific Action
  const [mode, setMode] = useState<'individual' | 'team_create' | 'team_join' | null>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const data = await hackathonService.getHackathon(id as string);
        setHackathon(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load hackathon details.',
          variant: 'destructive',
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHackathon();
  }, [id, router, toast]);

  const handleRegisterSolo = async () => {
    try {
      setSubmitting(true);
      const res = await hackathonService.register(id as string, { teamType: 'INDIVIDUAL' });
      setResult(res);
      setStep(3);
      toast({ title: 'Registered!', description: 'You have successfully registered for the hackathon.' });
    } catch (error) {
      toast({ title: 'Registration Failed', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({ title: 'Team name is required', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await hackathonService.createTeam({ hackathonId: id as string, teamName });
      setResult(res);
      setStep(3);
      toast({ title: 'Team Created!', description: 'Invite your friends using the code.' });
    } catch (error) {
      toast({ title: 'Failed to create team', description: 'Try another team name.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast({ title: 'Invite code is required', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await hackathonService.joinTeam({ hackathonId: id as string, inviteCode });
      setResult(res);
      setStep(3);
      toast({ title: 'Joined!', description: 'You have successfully joined the team.' });
    } catch (error) {
      toast({ title: 'Invalid code', description: 'Please check the invite code.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Invite code copied to clipboard.' });
  };

  if (loading) return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Trophy className="h-12 w-12 text-primary animate-bounce mx-auto" />
        <p className="text-muted-foreground font-medium">Preparing your registration...</p>
      </div>
    </div>
  );

  if (!hackathon) return null;

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24 max-w-2xl">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Registration Mode</h1>
              <p className="text-muted-foreground">How do you want to participate in {hackathon.title}?</p>
            </div>

            <div className="grid gap-4">
              {/* Individual Option */}
              {(hackathon.participationType === ParticipationType.INDIVIDUAL || hackathon.participationType === ParticipationType.BOTH) && (
                <Card 
                  className={cn(
                    "cursor-pointer border-2 transition-all hover:border-primary/50",
                    mode === 'individual' ? "border-primary bg-primary/5" : "border-border"
                  )}
                  onClick={() => setMode('individual')}
                >
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Participate Solo</h3>
                      <p className="text-sm text-muted-foreground italic">Experience the challenge on your own.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Option */}
              {(hackathon.participationType === ParticipationType.TEAM || hackathon.participationType === ParticipationType.BOTH) && (
                <>
                  <Card 
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:border-primary/50",
                      mode === 'team_create' ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => setMode('team_create')}
                  >
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Users className="h-8 w-8 text-violet-500" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">Create a Team</h3>
                        <p className="text-sm text-muted-foreground italic">Lead a new team and invite your peers.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:border-primary/50",
                      mode === 'team_join' ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => setMode('team_join')}
                  >
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Zap className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">Join a Team</h3>
                        <p className="text-sm text-muted-foreground italic">Enter an invite code to join an existing team.</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="flex gap-4">
               <Button variant="outline" className="flex-1 h-12" onClick={() => router.back()}>Cancel</Button>
               <Button 
                className="flex-1 h-12" 
                disabled={!mode} 
                onClick={() => {
                  if (mode === 'individual') handleRegisterSolo();
                  else setStep(2);
                }}
               >
                 Continue <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {mode === 'team_create' ? 'Create Your Team' : 'Join a Team'}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'team_create' ? 'Give your team a stellar name.' : 'Ask your team leader for the code.'}
              </p>
            </div>

            <Card className="border-2">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="input-field">{mode === 'team_create' ? 'Team Name' : 'Invite Code'}</Label>
                  <Input 
                    id="input-field"
                    placeholder={mode === 'team_create' ? 'e.g., Code Ninjas' : 'e.g., ABC-123-XYZ'}
                    value={mode === 'team_create' ? teamName : inviteCode}
                    onChange={(e) => mode === 'team_create' ? setTeamName(e.target.value) : setInviteCode(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>

                {mode === 'team_create' && (
                  <p className="text-xs text-muted-foreground bg-muted p-4 rounded-xl">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    As the creator, you will be the team leader. Team size is limited to {hackathon.maxTeamSize} members.
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-8 pt-0 flex gap-4">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button 
                  className="flex-1" 
                  disabled={submitting}
                  onClick={mode === 'team_create' ? handleCreateTeam : handleJoinTeam}
                >
                  {submitting ? 'Processing...' : mode === 'team_create' ? 'Create Team' : 'Join Team'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-10"
          >
            <div className="space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">You're In!</h1>
              <p className="text-xl text-muted-foreground">Successful registration for {hackathon.title}</p>
            </div>

            {mode === 'team_create' && result?.inviteCode && (
              <Card className="bg-primary/5 border-primary/20 p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Team Invite Code</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-3xl font-mono font-black text-primary tracking-widest uppercase">{result.inviteCode}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.inviteCode)}>
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">Share this code with your teammates so they can join.</p>
              </Card>
            )}

            <Button className="w-full h-14 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20" asChild>
              <Link href={`/dashboard`}>
                Go to Dashboard
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import Link from 'next/link';import { cn } from '@/lib/utils';

