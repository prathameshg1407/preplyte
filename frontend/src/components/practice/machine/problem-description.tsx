// src/components/practice/machine/problem-description.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QuestionDetail, DifficultyLevel } from "@/types/machine.types";
import { FileInput, FileOutput, AlertCircle, TestTube } from "lucide-react";

// Difficulty colors mapping
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  EASY: "text-green-500 border-green-500/30 bg-green-500/10",
  MEDIUM: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  HARD: "text-red-500 border-red-500/30 bg-red-500/10",
};

interface ProblemDescriptionProps {
  question: QuestionDetail;
}

export function ProblemDescription({ question }: ProblemDescriptionProps) {
  // Parse constraints - backend returns string, may be JSON array or plain text
  const parseConstraints = (constraints: string | null): string[] => {
    if (!constraints) return [];
    
    try {
      const parsed = JSON.parse(constraints);
      if (Array.isArray(parsed)) return parsed;
      return [constraints];
    } catch {
      // If not JSON, split by newlines or return as single item
      if (constraints.includes("\n")) {
        return constraints.split("\n").filter((c) => c.trim());
      }
      return [constraints];
    }
  };

  const constraintsList = parseConstraints(question.constraints);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold mb-2">{question.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={DIFFICULTY_COLORS[question.difficulty]}
            >
              {question.difficulty}
            </Badge>
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Description */}
        {question.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: question.description }}
            />
          </div>
        )}

        {/* Input Format */}
        {question.inputFormat && (
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <FileInput className="h-4 w-4" />
              Input Format
            </h3>
            <Card>
              <CardContent className="p-3 text-sm font-mono bg-muted/30 whitespace-pre-wrap">
                {question.inputFormat}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Output Format */}
        {question.outputFormat && (
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <FileOutput className="h-4 w-4" />
              Output Format
            </h3>
            <Card>
              <CardContent className="p-3 text-sm font-mono bg-muted/30 whitespace-pre-wrap">
                {question.outputFormat}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Constraints */}
        {constraintsList.length > 0 && (
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              Constraints
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {constraintsList.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sample Test Cases */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TestTube className="h-4 w-4" />
            Sample Test Cases
          </h3>
          <div className="space-y-4">
            {question.sampleTestCases.map((tc, index) => (
              <Card key={tc.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Example {index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Input:
                      </div>
                      <pre className="p-2 bg-muted rounded text-sm overflow-x-auto whitespace-pre-wrap">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Output:
                      </div>
                      <pre className="p-2 bg-muted rounded text-sm overflow-x-auto whitespace-pre-wrap">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {question.totalTestCases > question.sampleTestCases.length && (
            <p className="text-sm text-muted-foreground mt-3">
              + {question.totalTestCases - question.sampleTestCases.length} hidden test case
              {question.totalTestCases - question.sampleTestCases.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}