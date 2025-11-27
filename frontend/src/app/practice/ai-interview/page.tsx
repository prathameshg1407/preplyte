// src/app/practice/ai-interview/page.tsx

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateSessionForm, SessionHistoryList } from '@/components/practice/ai-interview';
import { useInterviewSessions } from '@/lib/hooks/use-interview';
import { useInterviewStore } from '@/lib/store/interview-store';

export default function AIInterviewPage() {
  const [activeTab, setActiveTab] = useState('new');
  const { isLoading, fetchNextPage } = useInterviewSessions();
  const { sessionHistory, historyHasMore } = useInterviewStore();

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Interview Practice</h1>
        <p className="text-muted-foreground mt-2">
          Practice your interview skills with our AI interviewer. Get real-time
          feedback and improve your responses.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="new">New Interview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <CreateSessionForm />
        </TabsContent>

        <TabsContent value="history">
          <SessionHistoryList
            sessions={sessionHistory}
            isLoading={isLoading}
            onLoadMore={() => fetchNextPage?.()}
            hasMore={historyHasMore}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}