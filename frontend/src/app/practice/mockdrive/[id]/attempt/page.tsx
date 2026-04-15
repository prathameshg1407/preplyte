// app/practice/mockdrive/[id]/attempt/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  ArrowRight, 
  Lock, 
  Clock, 
  AlertCircle,
  Trophy,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { cn } from '../../../../../lib/utils';
import { apiClient } from '../../../../../lib/api/axios-instance';
import { API_ENDPOINTS } from '../../../../../lib/api/endpoints';

export default function MockDriveAttemptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingModuleAttemptId, setStartingModuleAttemptId] = useState<string | null>(null);
  const isFetchingAttemptRef = useRef(false);
  const lastSyncAtRef = useRef(0);

  const mockDriveId = params.id as string;
  const attemptId = searchParams.get('attemptId');

  const fetchAttempt = useCallback(async (force = false) => {
    if (isFetchingAttemptRef.current) return;

    const now = Date.now();
    // Guard against accidental rapid-fire sync triggers.
    if (!force && now - lastSyncAtRef.current < 8000) {
      return;
    }

    try {
      isFetchingAttemptRef.current = true;
      setLoading(true);
      // Use sync endpoint to pull latest progress from sub-sessions
      const res = await apiClient.get(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.SYNC_ATTEMPT);
      lastSyncAtRef.current = Date.now();
      if (res.data) {
        if (res.data.status === 'COMPLETED') {
          router.replace(`/practice/mockdrive/${res.data.mockDriveId || mockDriveId}/results?attemptId=${res.data.id}`);
          return;
        }
        setAttempt(res.data);
      } else {
        setError('No active attempt found. Please return to the dashboard.');
      }
    } catch (err) {
      setError('Failed to load attempt details.');
    } finally {
      setLoading(false);
      isFetchingAttemptRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAttempt(true);

    // Also sync when the window gains focus (user returns from another tab/test)
    const onFocus = () => fetchAttempt(false);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [attemptId, fetchAttempt]);

  const startRound = async (moduleAttemptId: string, module: any) => {
    if (startingModuleAttemptId === moduleAttemptId) return;

    try {
      setStartingModuleAttemptId(moduleAttemptId);
      // Use the dedicated start-module endpoint which manages session creation and linking
      const res = await apiClient.post(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.ATTEMPT_MODULE_START(attempt.id, module.id));
      
      if (res.data && res.data.redirectUrl) {
        router.push(res.data.redirectUrl);
      } else {
        throw new Error('No redirect URL provided by server');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start round');
    } finally {
      setStartingModuleAttemptId(null);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center">Loading attempt...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p>{error}</p>
      <Button onClick={() => router.push('/practice/mockdrive')}>Back to Dashboard</Button>
    </div>
  );

  const currentModule = attempt.moduleAttempts.find((ma: any) => ma.status === 'AVAILABLE' || ma.status === 'IN_PROGRESS');
  const completedModules = attempt.moduleAttempts.filter((ma: any) => ma.status === 'COMPLETED');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Button variant="ghost" className="mb-8 gap-2" onClick={() => router.push('/practice/mockdrive')}>
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{attempt.mockDrive.title}</h1>
        <p className="mt-2 text-muted-foreground">In Progress • Round {completedModules.length + 1} of {attempt.moduleAttempts.length}</p>
      </div>

      <div className="grid gap-8">
        {attempt.moduleAttempts.sort((a: any, b: any) => a.module.order - b.module.order).map((ma: any, index: number) => (
          <motion.div
            key={ma.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "overflow-hidden border-2 transition-all duration-300",
              ma.status === 'AVAILABLE' || ma.status === 'IN_PROGRESS' ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border opacity-70",
              ma.status === 'COMPLETED' && "border-emerald-500/30 bg-emerald-500/5 opacity-100"
            )}>
              <div className="flex flex-col md:flex-row">
                <div className={cn(
                  "flex items-center justify-center p-6 md:w-24",
                  ma.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600" : 
                  ma.status === 'AVAILABLE' || ma.status === 'IN_PROGRESS' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {ma.status === 'COMPLETED' ? <CheckCircle2 className="h-8 w-8" /> : 
                   ma.status === 'LOCKED' ? <Lock className="h-8 w-8" /> : <Circle className="h-8 w-8 animate-pulse" />}
                </div>
                
                <CardHeader className="flex-1 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{ma.module.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {ma.module.moduleType.replace('_', ' ')} Round • {ma.module.timeLimit} Minutes
                      </CardDescription>
                    </div>
                    {ma.status === 'COMPLETED' && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {ma.percentage ? Math.round(ma.percentage) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Accuracy</div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <div className="flex items-center p-6 md:border-l">
                  {ma.status === 'AVAILABLE' || ma.status === 'IN_PROGRESS' ? (
                    <Button
                      size="lg"
                      className="w-full gap-2 px-8 shadow-md"
                      onClick={() => startRound(ma.id, ma.module)}
                      disabled={startingModuleAttemptId === ma.id}
                    >
                      {startingModuleAttemptId === ma.id
                        ? 'Starting...'
                        : ma.status === 'IN_PROGRESS'
                          ? 'Resume Round'
                          : 'Start Round'}
                      <Play className="h-4 w-4 fill-current" />
                    </Button>
                  ) : ma.status === 'COMPLETED' ? (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-500/10 h-10 px-4 text-sm font-bold">
                      COMPLETED
                    </Badge>
                  ) : (
                    <Button disabled variant="outline" className="w-full gap-2">
                      Locked
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {completedModules.length === attempt.moduleAttempts.length && (
         <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-12 text-center"
         >
            <Card className="rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/5 p-8">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
              <h2 className="text-2xl font-bold">MockDrive Completed!</h2>
              <p className="mt-2 text-muted-foreground">Congratulations! You have finished all the rounds of this mockdrive.</p>
              <Button size="lg" className="mt-8 gap-2" onClick={() => router.push(`/practice/mockdrive/${attempt.mockDriveId}/results?attemptId=${attempt.id}`)}>
                View Final Performance Report
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
         </motion.div>
      )}
    </div>
  );
}
