// src/app/practice/ai-interview/[sessionId]/layout.tsx

import { TooltipProvider } from '@/components/ui/tooltip';

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </TooltipProvider>
  );
}