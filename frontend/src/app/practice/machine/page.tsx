// src/app/practice/machine/page.tsx

import { Metadata } from "next";
import { TestSelector } from "../../../components/practice/machine/test-selector";
import { Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Machine Coding Practice | Preplyte",
  description: "Practice coding challenges and improve your programming skills",
};

export default function MachinePracticePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-secondary/50 to-transparent" />

      <div className="container max-w-3xl py-16 lg:py-20">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
            <Code2 className="h-7 w-7" />
          </div>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Machine Coding
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Improve your coding skills with real-world programming challenges.
            Practice data structures, algorithms, and problem-solving.
          </p>
        </div>

        {/* Test Selector */}
        <TestSelector />
      </div>
    </div>
  );
}