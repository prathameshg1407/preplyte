// src/app/practice/ai-interview/results/[sessionId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InterviewResults } from "../../../../../components/practice/ai-interview/interview-results";
import { getInterviewFeedback } from "../../../../../lib/api/services/interview.service";
import { FeedbackResponse } from "../../../../../types/aiInterview.types";
import { getErrorMessage } from "../../../../../lib/api/error-handler";

export default function InterviewResultsPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInterviewFeedback(sessionId);
      setFeedback(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [sessionId]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <InterviewResults
        sessionId={sessionId}
        feedback={feedback}
        loading={loading}
        error={error}
        onRetry={fetchFeedback}
      />
    </div>
  );
}