// src/components/practice/machine/problem-description.tsx

"use client";

import { Card, CardContent } from "../../ui/card";
import { ScrollArea } from "../../ui/scroll-area";
import type { QuestionDetail, DifficultyLevel } from "../../../types/machine.types";
import { FileInput, FileOutput, AlertCircle, FlaskConical, Hash, Eye } from "lucide-react";

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
      if (constraints.includes("\n")) {
        return constraints.split("\n").filter((c) => c.trim());
      }
      return [constraints];
    }
  };

  const constraintsList = parseConstraints(question.constraints);
  const hiddenTestCases = question.totalTestCases - question.sampleTestCases.length;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-5">
        {/* Header */}
        <div>
          <div className="mb-3 flex items-start justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{question.title}</h2>
            <DifficultyBadge difficulty={question.difficulty} />
          </div>

          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Description */}
        {question.description && (
          <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: question.description }} />
          </div>
        )}

        {/* Input Format */}
        {question.inputFormat && (
          <Section icon={FileInput} title="Input Format">
            <CodeBlock content={question.inputFormat} />
          </Section>
        )}

        {/* Output Format */}
        {question.outputFormat && (
          <Section icon={FileOutput} title="Output Format">
            <CodeBlock content={question.outputFormat} />
          </Section>
        )}

        {/* Constraints */}
        {constraintsList.length > 0 && (
          <Section icon={AlertCircle} title="Constraints">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {constraintsList.map((constraint, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Sample Test Cases */}
        <Section icon={FlaskConical} title="Examples">
          <div className="space-y-4">
            {question.sampleTestCases.map((tc, index) => (
              <Card key={tc.id} className="border-border">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    Example {index + 1}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Input
                      </label>
                      <CodeBlock content={tc.input} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Output
                      </label>
                      <CodeBlock content={tc.expectedOutput} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hiddenTestCases > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>
                {hiddenTestCases} hidden test case{hiddenTestCases > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </Section>
      </div>
    </ScrollArea>
  );
}

// Difficulty Badge Component
function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const labels: Record<DifficultyLevel, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
  };

  return (
    <span className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium">
      {labels[difficulty]}
    </span>
  );
}

// Section Component
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  );
}

// Code Block Component
function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary p-3 font-mono text-sm">
      {content}
    </pre>
  );
}