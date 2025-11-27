// src/app/practice/ai-interview/[sessionId]/page.tsx

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { InterviewSession } from "../../../../components/practice/ai-interview/interview-session";
import { useInterview } from "../../../../lib/hooks/use-interview";
import { Button } from "../../../../components/ui/button";

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
    progress,
    context,
    stopRecording,
    startRecording,
    submitAnswer,
    endSession,
  } = useInterview();

  useEffect(() => {
    if (!sessionId) {
      router.push("/practice/ai-interview");
    }
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mb-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (error && status === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold">Session Error</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={() => router.push("/practice/ai-interview")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
        progress={progress}
        context={context}
        onStopRecording={stopRecording}
        onStartRecording={startRecording}
        onSubmitAnswer={submitAnswer}
        onEndSession={endSession}
      />
    </div>
  );
}