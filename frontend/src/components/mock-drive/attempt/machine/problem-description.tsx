// src/components/practice/machine/problem-description.tsx

"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QuestionDetail, DifficultyLevel } from "@/types/machine.types";
import {
  FileInput,
  FileOutput,
  AlertCircle,
  FlaskConical,
  Hash,
  Eye,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemDescriptionProps {
  question: QuestionDetail;
}

const DIFFICULTY_STYLES: Record<DifficultyLevel, { color: string; bg: string }> = {
  EASY: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  MEDIUM: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  HARD: {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
  },
};

export function ProblemDescription({ question }: ProblemDescriptionProps) {
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
  const difficultyStyle = DIFFICULTY_STYLES[question.difficulty];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight">{question.title}</h2>
            <Badge
              className={cn(
                "shrink-0 border-0 font-medium",
                difficultyStyle.color,
                difficultyStyle.bg
              )}
            >
              {question.difficulty}
            </Badge>
          </div>

          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-xs font-normal">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        <div className="h-px bg-border" />

        {/* Description */}
        {question.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-sm prose-neutral max-w-none dark:prose-invert"
          >
            <div dangerouslySetInnerHTML={{ __html: question.description }} />
          </motion.div>
        )}

        {/* Input Format */}
        {question.inputFormat && (
          <Section icon={FileInput} title="Input Format" delay={0.15}>
            <CodeBlock content={question.inputFormat} />
          </Section>
        )}

        {/* Output Format */}
        {question.outputFormat && (
          <Section icon={FileOutput} title="Output Format" delay={0.2}>
            <CodeBlock content={question.outputFormat} />
          </Section>
        )}

        {/* Constraints */}
        {constraintsList.length > 0 && (
          <Section icon={AlertCircle} title="Constraints" delay={0.25}>
            <ul className="space-y-2">
              {constraintsList.map((constraint, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <code className="font-mono">{constraint}</code>
                </motion.li>
              ))}
            </ul>
          </Section>
        )}

        {/* Sample Test Cases */}
        <Section icon={FlaskConical} title="Examples" delay={0.3}>
          <div className="space-y-4">
            {question.sampleTestCases.map((tc, index) => (
              <motion.div
                key={tc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="rounded-xl border-2 border-border bg-muted/30 p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
                    {index + 1}
                  </div>
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
              </motion.div>
            ))}
          </div>

          {hiddenTestCases > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Eye className="h-4 w-4" />
              <span>
                + {hiddenTestCases} hidden test case{hiddenTestCases > 1 ? "s" : ""}
              </span>
            </motion.div>
          )}
        </Section>
      </div>
    </ScrollArea>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-sm">
      {content}
    </pre>
  );
}
