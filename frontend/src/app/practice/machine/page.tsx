// src/app/practice/machine/page.tsx

import { TestSelector } from "@/components/practice/machine/test-selector";

export default function MachinePracticePage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Machine Coding Practice</h1>
        <p className="text-muted-foreground">
          Improve your coding skills with real-world programming challenges
        </p>
      </div>

      <TestSelector />
    </div>
  );
}