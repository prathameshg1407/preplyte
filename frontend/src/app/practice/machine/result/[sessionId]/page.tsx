// src/app/practice/machine/result/[sessionId]/page.tsx

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMachine } from "@/lib/hooks/use-machine";
import { SessionResult } from "@/components/practice/machine/session-result";
import { Loader2 } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/practice/machine")}
            className="text-primary hover:underline"
          >
            Go back to practice
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <SessionResult result={result} />
    </div>
  );
}