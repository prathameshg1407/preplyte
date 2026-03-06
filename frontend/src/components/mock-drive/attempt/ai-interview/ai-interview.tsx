// src/components/practice/ai-interview/ai-interview.tsx
// Main AI Interview page component

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateSessionForm } from './session/create-session-form';
import { SessionHistoryList } from './history/session-history-list';
import { useInterviewSessions } from '@/lib/hooks/use-interview';
import { Mic, History } from 'lucide-react';

export default function AIInterviewPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  const {
    sessions,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInterviewSessions({ enabled: activeTab === 'history' });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Interview Practice</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with our AI-powered mock interviewer
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'history')}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            New Interview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <CreateSessionForm />
        </TabsContent>

        <TabsContent value="history">
          <SessionHistoryList
            sessions={sessions}
            isLoading={isLoading || isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            hasMore={hasNextPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}