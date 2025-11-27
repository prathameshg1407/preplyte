// src/app/practice/machine/page.tsx

import { Metadata } from "next";
import { TestSelector } from "../../../components/practice/machine/test-selector";

export const metadata: Metadata = {
  title: "Machine Coding Practice | Preplyte",
  description: "Practice coding challenges and improve your programming skills",
};

export default function MachinePracticePage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="container py-12 lg:py-16">
        <TestSelector />
      </div>
    </div>
  );
}