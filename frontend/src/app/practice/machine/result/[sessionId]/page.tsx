// src/app/practice/machine/result/[sessionId]/page.tsx

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMachine } from "../../../../../lib/hooks/use-machine";
import { SessionResult } from "../../../../../components/practice/machine/session-result";
import { Button } from "../../../../../components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Brain } from "lucide-react";
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

  if (isLoading || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-muted/30 p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
            <AlertCircle className="h-6 w-6 text-rose-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Error Loading Results</h2>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline">
            <Link href="/practice/machine">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="container py-12 lg:py-16">
        <SessionResult result={result} />
      </div>
    </div>
  );
}