// src/app/practice/machine/result/[sessionId]/page.tsx

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMachine } from "../../../../../lib/hooks/use-machine";
import { SessionResult } from "../../../../../components/practice/machine/session-result";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MachineResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { result, isLoading, error, fetchResults, resetSession } = useMachine();

  useEffect(() => {
    if (!result || result.sessionId !== sessionId) {
      fetchResults(sessionId).catch(() => {
        router.push("/practice/machine");
      });
    }
  }, [sessionId, result, fetchResults, router]);

  useEffect(() => {
    return () => {
      resetSession();
    };
  }, [resetSession]);

  // Loading state
  if (isLoading || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-md py-20">
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Error Loading Results</h2>
            <p className="mb-6 text-sm text-muted-foreground">{error}</p>
            <Button asChild variant="outline">
              <Link href="/practice/machine">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Practice
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-secondary/50 to-transparent" />

      <div className="container py-12 lg:py-16">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Session Complete</h1>
          <p className="text-muted-foreground">
            Here&apos;s a detailed breakdown of your performance
          </p>
        </div>

        <SessionResult result={result} />
      </div>
    </div>
  );
}