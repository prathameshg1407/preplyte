// src/app/practice/ai-interview/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Interview Practice | Preplyte",
  description: "Practice your interview skills with our AI-powered interviewer",
};

export default function AIInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}