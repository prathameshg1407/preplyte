// app/practice/mockdrive/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  History, 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Clock, 
  Layout, 
  MoreVertical,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { cn } from '../../../lib/utils';
import { apiClient } from '../../../lib/api/axios-instance';
import { API_ENDPOINTS } from '../../../lib/api/endpoints';

export default function MockDriveDashboard() {
  const router = useRouter();
  const [drives, setDrives] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingDriveId, setStartingDriveId] = useState<string | null>(null);
  const hasFetchedInitialData = useRef(false);

  useEffect(() => {
    if (hasFetchedInitialData.current) return;
    hasFetchedInitialData.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drivesRes, historyRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.BASE),
        apiClient.get(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.HISTORY)
      ]);
      setDrives(drivesRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      console.error('Error fetching mockdrive data:', err);
      setError('Failed to load your mockdrives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mockdrive?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.ID(id));
      setDrives(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete mockdrive');
    }
  };

  const startAttempt = async (id: string) => {
    if (startingDriveId === id) return;

    try {
      setStartingDriveId(id);

      // If an attempt is already in progress, resume it instead of creating a new one.
      const currentRes = await apiClient.get(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.CURRENT_ATTEMPT);
      const currentAttempt = currentRes?.data;
      if (currentAttempt?.id && currentAttempt?.mockDriveId) {
        router.push(`/practice/mockdrive/${currentAttempt.mockDriveId}/attempt?attemptId=${currentAttempt.id}`);
        return;
      }

      const res = await apiClient.post(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.ATTEMPTS(id));
      router.push(`/practice/mockdrive/${id}/attempt?attemptId=${res.data.id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to start attempt';

      if (String(message).toLowerCase().includes('in-progress')) {
        try {
          const currentRes = await apiClient.get(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.CURRENT_ATTEMPT);
          const currentAttempt = currentRes?.data;

          if (currentAttempt?.id && currentAttempt?.mockDriveId) {
            router.push(`/practice/mockdrive/${currentAttempt.mockDriveId}/attempt?attemptId=${currentAttempt.id}`);
            return;
          }
        } catch {
          // Fallback to alert below if current attempt cannot be fetched.
        }
      }

      alert(message);
    } finally {
      setStartingDriveId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse">Loading your practice sessions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Individual MockDrive</h1>
          <p className="mt-2 text-muted-foreground">
            Create custom placement simulations and practice at your own pace.
          </p>
        </div>
        <Button size="lg" className="h-12 gap-2 shadow-lg hover:shadow-primary/20" onClick={() => router.push('/practice/mockdrive/create')}>
          <Plus className="h-5 w-5" />
          Create New MockDrive
        </Button>
      </div>

      <Tabs defaultValue="my-drives" className="space-y-8">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="my-drives" className="gap-2">
            <Layout className="h-4 w-4" />
            My MockDrives
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Attempt History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-drives">
          {drives.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">No MockDrives yet</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Get started by creating your first personalized placement simulation.
              </p>
              <Button 
                variant="outline" 
                className="mt-8 border-primary/20 hover:bg-primary/5"
                onClick={() => router.push('/practice/mockdrive/create')}
              >
                Create your first MockDrive
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {drives.map((drive) => (
                <motion.div
                  key={drive.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                    <CardHeader className="relative pb-4">
                      <div className="absolute right-4 top-4">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(drive.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="mb-2 w-fit bg-primary/5 text-primary">
                        {drive._count?.modules || 0} Rounds
                      </Badge>
                      <CardTitle className="line-clamp-1">{drive.title}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[40px]">
                        {drive.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(drive.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 text-xs font-medium">
                          <Trophy className="h-3 w-3 text-amber-500" />
                          {drive._count?.attempts || 0} Attempts
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 pt-4">
                      <Button
                        className="w-full gap-2"
                        onClick={() => startAttempt(drive.id)}
                        disabled={startingDriveId === drive.id}
                      >
                        <Play className="h-4 w-4 fill-current" />
                        {startingDriveId === drive.id ? 'Starting...' : 'Start Practice'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <History className="mb-6 h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-xl font-bold">No history available</h3>
              <p className="mt-2 text-muted-foreground">Complete a MockDrive to see your results here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      item.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                      {item.status === 'COMPLETED' ? <Trophy className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                    </div>
                    <div>
                      <h4 className="font-bold">{item.mockDrive?.title}</h4>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className={cn(
                          "font-medium",
                          item.status === 'COMPLETED' ? "text-emerald-500" : "text-amber-500"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    {item.totalScore !== null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold">{item.totalScore}%</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
                      </div>
                    )}
                    <Button variant="ghost" className="gap-2" onClick={() => router.push(`/practice/mockdrive/${item.mockDriveId}/results?attemptId=${item.id}`)}>
                      View Results
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
