// src/app/hackathons/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Hackathon, 
  HackathonStatus, 
  ParticipationType 
} from '@/types/event.types';
import { hackathonService } from '@/lib/api/services/hackathon.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Globe, 
  Clock, 
  MapPin, 
  Info, 
  CheckCircle2, 
  ArrowLeft,
  Zap,
  Tag,
  Gift,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons?: string[] } | null>(null);
  const [regStatus, setRegStatus] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, eligibilityData, registrationData] = await Promise.all([
          hackathonService.getHackathon(id as string),
          hackathonService.checkEligibility(id as string),
          hackathonService.getRegistrationStatus(id as string)
        ]);
        setHackathon(data);
        setEligibility(eligibilityData);
        setRegStatus(registrationData);
      } catch (error) {
        console.error('Failed to fetch hackathon details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load hackathon details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12 space-y-8">
        <Skeleton className="h-8 w-32" />
        <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!hackathon) return null;

  const isRegistrationOpen = hackathon.status === HackathonStatus.REGISTRATION_OPEN;
  const isRegistered = regStatus?.registered;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 gap-2 hover:bg-transparent hover:text-primary pl-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hackathons
      </Button>

      {/* Hero Banner */}
      <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden mb-12 shadow-2xl">
        {hackathon.bannerUrl ? (
          <img 
            src={hackathon.bannerUrl} 
            alt={hackathon.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent flex items-center justify-center">
            <Trophy className="h-24 w-24 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 lg:p-12">
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary hover:bg-primary border-none text-primary-foreground font-bold">
                {hackathon.mode}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-md border-none text-white font-bold">
                {hackathon.participationType}
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{hackathon.title}</h1>
            <p className="text-xl text-white/80 font-medium">{hackathon.tagline}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full justify-start gap-2 border-none">
              <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">About</TabsTrigger>
              <TabsTrigger value="prizes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Prizes</TabsTrigger>
              <TabsTrigger value="faq" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-8 space-y-10">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Description
                </h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {hackathon.description}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Tag className="h-6 w-6 text-primary" />
                  Themes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {hackathon.themes.map(theme => (
                    <Badge key={theme} variant="secondary" className="px-4 py-2 text-sm font-medium rounded-lg">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="prizes" className="mt-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {hackathon.prizes?.map((prize, idx) => (
                  <Card key={idx} className="border-2 border-primary/10 hover:border-primary/30 transition-all group overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4 bg-primary/5">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{prize.position}</CardTitle>
                        <p className="text-primary font-bold">{prize.prize}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                      <p className="text-sm font-semibold mb-2">{prize.title}</p>
                      <p className="text-sm text-muted-foreground">{prize.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-8">
               <Card className="bg-muted/30 border-none shadow-none">
                 <CardContent className="p-8">
                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                      {hackathon.rules || 'Standard hackathon rules apply.'}
                    </pre>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <Card className="border-2 shadow-xl overflow-hidden sticky top-24">
            <div className="h-2 bg-gradient-to-r from-primary to-violet-500" />
            <CardContent className="p-6 space-y-8">
              {/* Status Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registration Status</p>
                  <Badge variant={isRegistrationOpen ? 'default' : 'secondary'}>
                    {hackathon.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {isRegistrationOpen && (
                   <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-xl">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-orange-600">Ends In</p>
                        <p className="text-sm font-bold">{format(new Date(hackathon.registrationEndDate), 'PPP')}</p>
                      </div>
                   </div>
                )}
              </div>

              {/* Eligibility Check */}
              {eligibility && (
                <div className={cn(
                  "rounded-2xl p-5 flex gap-4 transition-all",
                  eligibility.eligible ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-destructive/10 border border-destructive/20"
                )}>
                  {eligibility.eligible ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
                  )}
                  <div className="space-y-1">
                    <p className={cn(
                      "text-sm font-bold",
                      eligibility.eligible ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
                    )}>
                      {eligibility.eligible ? 'Ready to hack!' : 'Not Eligible'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {eligibility.eligible 
                        ? 'Your profile meets all requirements.' 
                        : eligibility.reasons?.[0] || 'Requirements not met.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {isRegistered ? (
                  <Button className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" asChild>
                    <Link href={`/hackathons/${hackathon.id}/dashboard`}>
                      Go to Hackathon Dashboard
                      <Zap className="ml-2 h-5 w-5 fill-current" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20 group" 
                    disabled={!isRegistrationOpen || !eligibility?.eligible}
                    onClick={() => router.push(`/hackathons/${hackathon.id}/register`)}
                  >
                    Register Now
                    <ArrowLeft className="h-5 w-5 rotate-180 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
                
                <p className="text-[10px] text-center text-muted-foreground px-4 uppercase tracking-tighter">
                  By registering you agree to the terms and code of conduct
                </p>
              </div>

              {/* Key Info List */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">Team Size</p>
                    <p className="text-sm font-bold">{hackathon.minTeamSize}-{hackathon.maxTeamSize} Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">Participation</p>
                    <p className="text-sm font-bold capitalize">{hackathon.participationType.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

