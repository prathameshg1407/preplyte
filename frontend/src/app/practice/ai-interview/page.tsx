// src/app/practice/ai-interview/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Mic,
  ArrowRight,
} from "lucide-react";
import { InterviewConfigForm } from "../../../components/practice/ai-interview/interview-config-form";
import { SessionCard } from "../../../components/practice/ai-interview/session-card";
import { useInterview } from "../../../lib/hooks/use-interview";
import { profileService } from "../../../lib/api/services/profile.service";

interface Resume {
  id: number;
  fileName: string;
  isDefault?: boolean;
}

export default function AIInterviewPage() {
  const router = useRouter();
  const {
    loading,
    error,
    sessions,
    sessionsPagination,
    stats,
    startSession,
    fetchUserSessions,
    fetchUserStats,
    deleteSession,
  } = useInterview();

  const [activeTab, setActiveTab] = useState("start");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUserSessions({ page: 1, limit: 20 });
    fetchUserStats();
  }, []);

 const fetchResumes = useCallback(async (): Promise<Resume[]> => {
  try {
    const response = await profileService.getResumes();
    // Access the array property - adjust 'resumes' to match your actual response structure
    return response.resumes.map((r: any) => ({
      id: r.id,
      fileName: r.fileName,
      isDefault: r.isDefault,
    }));
  } catch {
    return [];
  }
}, []);

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteSession(sessionToDelete);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleContinue = (sessionId: string) => {
    router.push(`/practice/ai-interview/${sessionId}`);
  };

  const handleViewResults = (sessionId: string) => {
    router.push(`/practice/ai-interview/results/${sessionId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUserSessions({ page, limit: 20 });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center">
            <Mic className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Interview</h1>
        </div>
        <p className="text-muted-foreground">
          Practice with an AI interviewer and get instant feedback
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8 p-4 border border-border rounded-lg bg-card">
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{stats.completedSessions}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{stats.averageScore}%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{stats.totalQuestionsAnswered}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6 grid grid-cols-2">
          <TabsTrigger value="start">New Interview</TabsTrigger>
          <TabsTrigger value="history">
            History {sessionsPagination.total > 0 && `(${sessionsPagination.total})`}
          </TabsTrigger>
        </TabsList>

        {/* New Interview */}
        <TabsContent value="start" className="mt-0">
          <InterviewConfigForm
            onStart={startSession}
            loading={loading}
            error={error}
            onFetchResumes={fetchResumes}
          />
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-0">
          {sessions.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mx-auto">
                    <Mic className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">No interviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start your first practice session
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("start")}
                  >
                    Start Interview
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onContinue={handleContinue}
                  onViewResults={handleViewResults}
                  onDelete={handleDeleteClick}
                  isDeleting={deleteLoading && sessionToDelete === session.id}
                />
              ))}

              {/* Pagination */}
              {sessionsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {sessionsPagination.page} / {sessionsPagination.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= sessionsPagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this interview session and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}