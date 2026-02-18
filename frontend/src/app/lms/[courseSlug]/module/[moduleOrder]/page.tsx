// src/app/lms/[courseSlug]/module/[moduleOrder]/page.tsx

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  CheckCircle,
  Lock,
  FileText,
  Video,
  Trophy,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useModuleDetails } from "@/lib/hooks/lms/use-lms";
import { LmsTopicStatus } from "@/types/lms.types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Progress } from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const moduleOrder = parseInt(params.moduleOrder as string);

  const { data, isLoading, error } = useModuleDetails(courseSlug, moduleOrder);

  const module = data?.module;
  const topics = data?.topics || [];
  const moduleTest = data?.moduleTest;
  const progress = data?.progress;
  const courseTitle = data?.courseTitle;

  if (isLoading) {
    return <ModulePageSkeleton />;
  }

  if (error || !module) {
    const isLocked = (error as any)?.response?.status === 403;
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          {isLocked ? (
            <Lock className="h-12 w-12 mx-auto text-orange-500 mb-4" />
          ) : (
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {isLocked ? "Module Locked" : "Module Not Found"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {isLocked
              ? "This module is locked. Please complete the previous modules and tests to unlock it."
              : "This module doesn't exist or you don't have access to it."}
          </p>
          <Button asChild>
            <Link href={`/lms/${courseSlug}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completedTopics = topics.filter(
    (t) => t.progress?.status === "COMPLETED",
  ).length;
  const allTopicsCompleted = completedTopics === topics.length;
  const canTakeTest = allTopicsCompleted && moduleTest && !progress?.testPassed;

  const getTopicStatusIcon = (status?: LmsTopicStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "IN_PROGRESS":
        return <Play className="h-5 w-5 text-blue-600" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href="/lms" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/lms/${courseSlug}`} className="hover:text-foreground">
              {courseTitle}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Module {moduleOrder}</span>
          </motion.div>

          {/* Module Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Module {moduleOrder}</Badge>
              {progress?.status === "COMPLETED" && (
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              )}
              {progress?.status === "IN_PROGRESS" && (
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
            <p className="text-lg text-muted-foreground">
              {module.shortDescription}
            </p>
          </motion.div>

          {/* Module Description */}
          {module.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>About this Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: module.description }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Topics List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Topics in this Module</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {completedTopics} of {topics.length} completed
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topics.map((topic, index) => {
                  const topicStatus = topic.progress?.status;
                  const isCompleted = topicStatus === "COMPLETED";
                  const isFirst = index === 0;
                  const prevCompleted =
                    index === 0 ||
                    topics[index - 1]?.progress?.status === "COMPLETED";
                  const isAccessible = isFirst || prevCompleted;

                  return (
                    <div
                      key={topic.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isCompleted
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                        : isAccessible
                          ? "hover:bg-muted/50 cursor-pointer"
                          : "opacity-60"
                        }`}
                    >
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {!isAccessible ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          getTopicStatusIcon(topicStatus)
                        )}
                      </div>

                      {/* Topic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {topic.order}.
                          </span>
                          <h4 className="font-medium truncate">
                            {topic.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Theory</span>
                          </div>
                          {topic.videoUrl && (
                            <div className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              <span>
                                Video
                                {topic.videoDuration &&
                                  ` (${Math.round(topic.videoDuration / 60)} min)`}
                              </span>
                            </div>
                          )}
                          {topic.estimatedMinutes > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{topic.estimatedMinutes} min</span>
                            </div>
                          )}
                        </div>

                        {/* Topic Progress */}
                        {topic.progress && topicStatus !== "NOT_STARTED" && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            {topic.progress.theoryCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Theory
                              </Badge>
                            )}
                            {topic.progress.videoWatched && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isAccessible && (
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          asChild
                        >
                          <Link
                            href={`/lms/${courseSlug}/module/${moduleOrder}/topic/${topic.order}`}
                          >
                            {isCompleted
                              ? "Review"
                              : topicStatus === "IN_PROGRESS"
                                ? "Continue"
                                : "Start"}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Module Test Section */}
          {moduleTest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card
                className={`${progress?.testPassed
                  ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20"
                  : canTakeTest
                    ? "border-primary"
                    : ""
                  }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    Module Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {moduleTest.instructions}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {moduleTest.totalQuestions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Questions
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {moduleTest.timeLimitMinutes}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Minutes
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {moduleTest.passingScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Passing Score
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {moduleTest.totalPoints}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Points
                      </div>
                    </div>
                  </div>

                  {/* Test Status */}
                  {progress?.testAttempted && (
                    <div
                      className={`p-4 rounded-lg ${progress.testPassed
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {progress.testPassed
                              ? "Test Passed!"
                              : "Test Not Passed"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score: {progress.testScore}% • Points earned:{" "}
                            {progress.pointsEarned}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Attempts: {progress.testAttempts} /{" "}
                          {moduleTest.maxAttempts}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Button */}
                  {!allTopicsCompleted ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Complete all topics to unlock the test</span>
                    </div>
                  ) : progress?.testPassed ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test Completed
                    </Button>
                  ) : (progress?.testAttempts ?? 0) >=
                    moduleTest.maxAttempts ? (
                    <Button variant="outline" className="w-full" disabled>
                      No Attempts Remaining
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link
                        href={`/lms/${courseSlug}/module/${moduleOrder}/test`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {progress?.testAttempted ? "Retake Test" : "Take Test"}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between"
          >
            <Button variant="outline" asChild>
              <Link href={`/lms/${courseSlug}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Link>
            </Button>
            {progress?.status === "COMPLETED" && (
              <Button asChild>
                <Link href={`/lms/${courseSlug}/module/${moduleOrder + 1}`}>
                  Next Module
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-20 space-y-4"
          >
            {/* Module Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">
                      {Math.round(progress?.progressPercent || 0)}%
                    </span>
                  </div>
                  <Progress value={progress?.progressPercent || 0} />
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Topics Completed</span>
                    </div>
                    <span className="font-medium">
                      {completedTopics} / {topics.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Topics Completed</span>
                    </div>
                    <span className="font-medium">
                      {completedTopics} / {topics.length}
                    </span>
                  </div>

                  {(module.estimatedMinutes > 0) && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Time Required</span>
                      </div>
                      <span className="font-medium">
                        {module.estimatedMinutes} min
                      </span>
                    </div>
                  )}

                  {(module.points > 0) && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>Points Available</span>
                      </div>
                      <span className="font-medium">{module.points} pts</span>
                    </div>
                  )}

                  {progress && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span>Points Earned</span>
                      </div>
                      <span className="font-medium text-green-600">
                        {progress.pointsEarned} pts
                      </span>
                    </div>
                  )}

                  {(progress?.timeSpentMinutes ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Time Spent</span>
                      </div>
                      <span className="font-medium">
                        {progress?.timeSpentMinutes} min
                      </span>{" "}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Test Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Module Test</span>
                    {progress?.testPassed ? (
                      <Badge className="bg-green-100 text-green-800">
                        Passed
                      </Badge>
                    ) : progress?.testAttempted ? (
                      <Badge variant="destructive">Not Passed</Badge>
                    ) : allTopicsCompleted ? (
                      <Badge variant="outline">Ready</Badge>
                    ) : (
                      <Badge variant="secondary">Locked</Badge>
                    )}
                  </div>
                  {progress?.testScore !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      Best Score: {progress.testScore}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topics.slice(0, 5).map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/lms/${courseSlug}/module/${moduleOrder}/topic/${topic.order}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted text-sm"
                    >
                      {getTopicStatusIcon(topic.progress?.status)}
                      <span className="truncate">{topic.title}</span>
                    </Link>
                  ))}
                  {topics.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{topics.length - 5} more topics
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ModulePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}
