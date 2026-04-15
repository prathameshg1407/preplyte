// app/practice/mockdrive/[id]/results/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  ChevronLeft, 
  Download, 
  Share2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../../components/ui/table';
import { cn } from '../../../../../lib/utils';
import { apiClient } from '../../../../../lib/api/axios-instance';
import { API_ENDPOINTS } from '../../../../../lib/api/endpoints';

export default function MockDriveResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const attemptId = searchParams.get('attemptId');

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    if (!attemptId) {
      setError('Attempt ID is missing. Please open results from an attempt.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.INDIVIDUAL_MOCKDRIVE.ATTEMPT_DETAIL(attemptId));
      setAttempt(res.data);
    } catch (err) {
      setError('Failed to load performance report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center">Generating your performance report...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <p>{error}</p>
      <Button onClick={() => router.push('/practice/mockdrive')}>Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.push('/practice/mockdrive')}>
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Hero Performance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-12 text-center"
      >
        <Trophy className="mx-auto mb-6 h-20 w-20 text-amber-500 drop-shadow-lg" />
        <h1 className="text-4xl font-black tracking-tight mb-2">Drive Performance Report</h1>
        <p className="text-muted-foreground uppercase tracking-[0.2em] font-medium text-sm">
          {attempt.mockDrive?.title}
        </p>
        
        <div className="mt-12 flex flex-col items-center justify-center gap-12 sm:flex-row">
          <div className="text-center">
            <div className="text-6xl font-black text-primary">{attempt.totalScore || 0}%</div>
            <div className="mt-2 text-sm font-bold text-muted-foreground uppercase">Overall Score</div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div className="text-center">
             <div className="flex items-center justify-center gap-2 text-2xl font-bold">
               <Clock className="h-6 w-6 text-blue-500" />
               {attempt.mockDrive?._count?.modules || attempt.moduleAttempts?.length || 0} Rounds
             </div>
             <div className="mt-2 text-sm font-bold text-muted-foreground uppercase">Simulation Complete</div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div className="text-center">
             <div className="flex items-center justify-center gap-2 text-2xl font-bold">
               <TrendingUp className="h-6 w-6 text-emerald-500" />
               Top 15%
             </div>
             <div className="mt-2 text-sm font-bold text-muted-foreground uppercase">Percentile</div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Breakdown Table */}
        <Card className="rounded-3xl border-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Section-wise Breakdown
            </CardTitle>
            <CardDescription>Detailed analysis of each round in your mockdrive.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold">Round Name</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Accuracy / Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempt.moduleAttempts?.sort((a: any, b: any) => a.module?.order - b.module?.order).map((ma: any) => {
                  const modulePercentage = Number.isFinite(ma?.percentage) ? ma.percentage : 0;
                  return (
                  <TableRow key={ma.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-semibold">{ma.module?.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted text-xs uppercase tracking-tight">
                        {ma.module?.moduleType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "text-lg font-bold",
                        modulePercentage >= 70 ? "text-emerald-500" : modulePercentage >= 40 ? "text-amber-500" : "text-rose-500"
                      )}>
                        {Math.round(modulePercentage)}%
                      </span>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Suggestions */}
        <Card className="rounded-2xl border-2 sm:col-span-3">
           <CardHeader>
             <CardTitle>Next Steps for Improvement</CardTitle>
           </CardHeader>
           <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-4 rounded-xl border-2 p-4 transition-all hover:border-primary/20">
                 <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                 </div>
                 <div>
                    <h4 className="font-bold">Master Aptitude</h4>
                    <p className="text-sm text-muted-foreground mt-1">Your logic skills are strong. Focus on data interpretation to cross 90%.</p>
                    <Button variant="link" className="p-0 h-auto mt-2 gap-1 text-primary" onClick={() => router.push('/practice/aptitude')}>
                      Practice Aptitude <ArrowRight className="h-3 w-3" />
                    </Button>
                 </div>
              </div>
              <div className="flex gap-4 rounded-xl border-2 p-4 transition-all hover:border-primary/20">
                 <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-6 w-6 text-amber-500" />
                 </div>
                 <div>
                    <h4 className="font-bold">Refine Communication</h4>
                    <p className="text-sm text-muted-foreground mt-1">AI Interview score can be improved by using more structured technical vocabulary.</p>
                    <Button variant="link" className="p-0 h-auto mt-2 gap-1 text-primary" onClick={() => router.push('/practice/ai-interview')}>
                      Try AI Interview <ArrowRight className="h-3 w-3" />
                    </Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center">
        <Button size="lg" className="h-14 px-12 text-lg font-bold rounded-full shadow-xl hover:shadow-primary/20" onClick={() => router.push('/practice/mockdrive/create')}>
          Design Another MockDrive
        </Button>
      </div>
    </div>
  );
}
