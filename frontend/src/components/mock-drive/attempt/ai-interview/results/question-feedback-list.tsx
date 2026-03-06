// src/components/practice/ai-interview/results/question-feedback-list.tsx

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { QuestionFeedbackItem, QuestionCategory } from '@/types/interview.types';

interface QuestionFeedbackListProps {
  questions: QuestionFeedbackItem[];
}

const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  INTRODUCTORY: 'bg-green-500/10 text-green-700',
  TECHNICAL: 'bg-blue-500/10 text-blue-700',
  BEHAVIORAL: 'bg-purple-500/10 text-purple-700',
  SITUATIONAL: 'bg-orange-500/10 text-orange-700',
  CLOSING: 'bg-gray-500/10 text-gray-700',
};

export function QuestionFeedbackList({ questions }: QuestionFeedbackListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Question-by-Question Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question, index) => (
          <QuestionFeedbackCard key={question.questionId} question={question} index={index} />
        ))}
      </CardContent>
    </Card>
  );
}

function QuestionFeedbackCard({
  question,
  index,
}: {
  question: QuestionFeedbackItem;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const overallScore = question.scores.overall;
  const scorePercentage = (overallScore / 10) * 100;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-muted/50"
          >
            <div className="flex items-start gap-3 text-left">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', CATEGORY_COLORS[question.category])}>
                    {question.category}
                  </Badge>
                </div>
                <p className="font-medium line-clamp-2">{question.question}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-semibold">{overallScore.toFixed(1)}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t">
            {/* Answer */}
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Your Answer</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {question.answer || 'No answer recorded'}
              </p>
            </div>

            {/* Scores */}
            <div>
              <h4 className="text-sm font-medium mb-3">Score Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(question.scores)
                  .filter(([key]) => key !== 'overall')
                  .map(([key, value]) => {
                    if (value === null) return null;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key}</span>
                          <span>{(value as number).toFixed(1)}/10</span>
                        </div>
                        <Progress value={((value as number) / 10) * 100} className="h-1.5" />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Feedback */}
            {question.feedback && (
              <div>
                <h4 className="text-sm font-medium mb-2">Feedback</h4>
                <p className="text-sm text-muted-foreground">{question.feedback}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}