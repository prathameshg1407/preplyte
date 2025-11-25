// src/app/practice/aptitude/result/[sessionId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TestResult } from '@/components/practice/aptitude';
import { SolutionItem } from '@/components/practice/aptitude';
import { useAptitude } from '@/lib/hooks/use-aptitude';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { GetSolutionsResponse, SolutionFilter } from '@/types/aptitude.types';

export default function AptitudeResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { result, isLoading, fetchResults, fetchSolutions } = useAptitude();

  const [activeTab, setActiveTab] = useState<'results' | 'solutions'>('results');
  const [solutions, setSolutions] = useState<GetSolutionsResponse | null>(null);
  const [solutionsFilter, setSolutionsFilter] = useState<SolutionFilter>('all');
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);

  // Fetch results on mount
  useEffect(() => {
    if (sessionId && !result) {
      fetchResults(sessionId).catch(() => {
        // Error is handled by the hook
      });
    }
  }, [sessionId, result, fetchResults]);

  // Fetch solutions when tab changes or filter changes
  useEffect(() => {
    const loadSolutions = async () => {
      if (activeTab === 'solutions' && sessionId) {
        setIsLoadingSolutions(true);
        try {
          const data = await fetchSolutions(sessionId, { filter: solutionsFilter });
          setSolutions(data);
        } catch {
          // Error handled in hook
        } finally {
          setIsLoadingSolutions(false);
        }
      }
    };

    loadSolutions();
  }, [activeTab, solutionsFilter, sessionId, fetchSolutions]);

  // Handle view solutions from result card
  const handleViewSolutions = (filter: SolutionFilter) => {
    setSolutionsFilter(filter);
    setActiveTab('solutions');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container max-w-md py-16">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Result Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find the results for this session. It may not be
              completed yet or doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href="/practice/aptitude">
                <RotateCcw className="mr-2 h-4 w-4" />
                Start New Practice
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s a detailed breakdown of your performance
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'results' | 'solutions')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="solutions">
            <Eye className="h-4 w-4 mr-2" />
            Solutions
          </TabsTrigger>
        </TabsList>

        {/* Results Tab */}
        <TabsContent value="results">
          <TestResult result={result} onViewSolutions={handleViewSolutions} />
        </TabsContent>

        {/* Solutions Tab */}
        <TabsContent value="solutions" className="space-y-6">
          {/* Filter */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Review Solutions
                </CardTitle>
                <Select
                  value={solutionsFilter}
                  onValueChange={(v) => setSolutionsFilter(v as SolutionFilter)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Questions
                    </SelectItem>
                    <SelectItem value="correct">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Correct Only
                      </span>
                    </SelectItem>
                    <SelectItem value="wrong">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Wrong Only
                      </span>
                    </SelectItem>
                    <SelectItem value="unanswered">
                      <span className="flex items-center gap-2">
                        <MinusCircle className="h-4 w-4 text-muted-foreground" />
                        Unanswered Only
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSolutions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : solutions && solutions.solutions.length > 0 ? (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-4 mb-6 p-3 bg-muted/50 rounded-lg text-sm">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {solutions.summary.totalCorrect} correct
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {solutions.summary.totalWrong} wrong
                    </span>
                    <span className="flex items-center gap-1">
                      <MinusCircle className="h-4 w-4 text-muted-foreground" />
                      {solutions.summary.totalUnanswered} skipped
                    </span>
                  </div>

                  {/* Solutions List */}
                  <Accordion type="single" collapsible className="space-y-2">
                    {solutions.solutions.map((solution, index) => (
                      <SolutionItem
                        key={solution.questionId}
                        solution={solution}
                        index={index}
                      />
                    ))}
                  </Accordion>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No questions match the selected filter.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" className="flex-1 h-12">
              <Link href="/practice/aptitude">
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setActiveTab('results')}
            >
              Back to Results
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}