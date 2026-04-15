'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { InterviewWebSocketProvider } from '@/lib/contexts/interview-websocket-context';

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InterviewWebSocketProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </TooltipProvider>
    </InterviewWebSocketProvider>
  );
}
