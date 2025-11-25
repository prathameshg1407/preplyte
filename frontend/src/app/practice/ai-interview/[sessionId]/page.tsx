"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { InterviewSession } from "@/components/practice/ai-interview/interview-session";
import { useInterview } from "@/lib/hooks/use-interview";
import { Button } from "@/components/ui/button";

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const {
    status,
    loading,
    error,
    currentQuestionIndex,
    currentQuestionText,
    currentCategory,
    currentTranscript,
    fullTranscript,
    silenceTimer,
    isRecording,
    isAiSpeaking,
    isProcessing,
    micPermission,
    totalQuestions,
    stopRecording,
    startRecording,
    submitAnswer,
    cancelSession,
  } = useInterview();

  // Redirect if no sessionId
  useEffect(() => {
    if (!sessionId) {
      router.push("/practice/ai-interview");
    }
  }, [sessionId, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading interview session...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Session ID: {sessionId}
        </p>
      </div>
    );
  }

  // Error state
  if (error && status === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Session Error</h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button
            onClick={() => router.push("/practice/ai-interview")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Interview Home
          </Button>
        </div>
      </div>
    );
  }

  // Main interview session
  return (
    <div className="h-screen overflow-hidden">
      <InterviewSession
        status={status}
        currentQuestionText={currentQuestionText}
        currentCategory={currentCategory}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        currentTranscript={currentTranscript}
        fullTranscript={fullTranscript}
        silenceTimer={silenceTimer}
        error={error}
        isRecording={isRecording}
        isAiSpeaking={isAiSpeaking}
        isProcessing={isProcessing}
        micPermission={micPermission}
        onStopRecording={stopRecording}
        onStartRecording={startRecording}
        onSubmitAnswer={submitAnswer}
        onCancel={cancelSession}
      />
    </div>
  );
}