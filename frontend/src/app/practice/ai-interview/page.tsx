"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  History,
  BarChart3,
  Loader2,
  Plus,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";
import { InterviewConfigForm } from "@/components/practice/ai-interview/interview-config-form";
import { SessionCard } from "@/components/practice/ai-interview/session-card";
import { useInterview } from "@/lib/hooks/use-interview";
import { profileService } from "@/lib/api/services/profile.service";

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
    stats,
    startSession,
    fetchUserSessions,
    fetchUserStats,
    deleteSession,
    setError,
  } = useInterview();

  const [activeTab, setActiveTab] = useState("start");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchUserSessions();
    fetchUserStats();
  }, [fetchUserSessions, fetchUserStats]);

  // Fetch resumes callback for config form
  const fetchResumes = useCallback(async (): Promise<Resume[]> => {
    try {
      // Assuming you have a profile service
      const resumes = await profileService.getResumes();
      return resumes.map((r: any) => ({
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Interview Practice</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with our AI-powered interviewer and get
          instant feedback
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedSessions}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold">
                    {stats.totalQuestionsAnswered}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="start" className="gap-2">
            <Plus className="w-4 h-4" />
            New Interview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* New Interview Tab */}
        <TabsContent value="start">
          <InterviewConfigForm
            onStart={startSession}
            loading={loading}
            error={error}
            onFetchResumes={fetchResumes}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
              <CardDescription>
                View your past interview sessions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first AI interview practice session
                  </p>
                  <Button onClick={() => setActiveTab("start")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Interview
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
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
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview session? This action
              cannot be undone and all data including feedback will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
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