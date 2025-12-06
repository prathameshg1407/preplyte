'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  TestResult,
  SolutionItem,
} from '../../../../../components/practice/aptitude';
import { useAptitude } from '../../../../../lib/hooks/use-aptitude';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../components/ui/tabs';
import { Accordion } from '../../../../../components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import type {
  GetSolutionsResponse,
  SolutionFilter,
} from '../../../../../types/aptitude.types';

export default function AptitudeResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { result, isLoading, fetchResults, fetchSolutions } = useAptitude();

  const [activeTab, setActiveTab] = useState<'results' | 'solutions'>('results');
  const [solutions, setSolutions] = useState<GetSolutionsResponse | null>(null);
  const [solutionsFilter, setSolutionsFilter] = useState<SolutionFilter>('all');
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);

  useEffect(() => {
    if (sessionId && !result) {
      fetchResults(sessionId).catch(() => {});
    }
  }, [sessionId, result, fetchResults]);

  useEffect(() => {
    const loadSolutions = async () => {
      if (activeTab === 'solutions' && sessionId) {
        setIsLoadingSolutions(true);
        try {
          const data = await fetchSolutions(sessionId, {
            filter: solutionsFilter,
          });
          setSolutions(data);
        } catch {
        } finally {
          setIsLoadingSolutions(false);
        }
      }
    };

    loadSolutions();
  }, [activeTab, solutionsFilter, sessionId, fetchSolutions]);

  const handleViewSolutions = (filter: SolutionFilter) => {
    setSolutionsFilter(filter);
    setActiveTab('solutions');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-background">
        <div className="container max-w-md py-20">
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">Result Not Found</h2>
              <p className="mb-8 text-sm text-muted-foreground">
                We couldn&apos;t find the results for this session.
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-3xl py-12 lg:py-16">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">
            Test Results
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s a detailed breakdown of your performance
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'results' | 'solutions')}
        >
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="solutions" className="gap-2">
              <Eye className="h-4 w-4" />
              Solutions
            </TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results">
            <TestResult result={result} onViewSolutions={handleViewSolutions} />
          </TabsContent>

          {/* Solutions Tab */}
          <TabsContent value="solutions" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Eye className="h-4 w-4" />
                    Review Solutions
                  </CardTitle>
                  <Select
                    value={solutionsFilter}
                    onValueChange={(v) =>
                      setSolutionsFilter(v as SolutionFilter)
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Questions</SelectItem>
                      <SelectItem value="correct">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Correct
                        </span>
                      </SelectItem>
                      <SelectItem value="wrong">
                        <span className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5" />
                          Wrong
                        </span>
                      </SelectItem>
                      <SelectItem value="unanswered">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <MinusCircle className="h-3.5 w-3.5" />
                          Unanswered
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                {isLoadingSolutions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : solutions && solutions.solutions.length > 0 ? (
                  <>
                    <div className="mb-6 flex items-center gap-6 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        {solutions.summary.totalCorrect} correct
                      </span>
                      <span className="flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" />
                        {solutions.summary.totalWrong} wrong
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MinusCircle className="h-4 w-4" />
                        {solutions.summary.totalUnanswered} skipped
                      </span>
                    </div>

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
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No questions match the selected filter.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/practice/aptitude">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice Again
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setActiveTab('results')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
