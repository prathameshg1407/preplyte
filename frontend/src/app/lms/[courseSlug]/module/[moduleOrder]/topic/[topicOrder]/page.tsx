// src/app/lms/[courseSlug]/module/[moduleOrder]/topic/[topicOrder]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  CheckCircle,
  FileText,
  Video,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Download,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useTopicDetails, useUpdateTopicProgress } from '@/lib/hooks/lms/use-lms';
import { useLmsStore } from '@/lib/store/lms-store';
import { getVideoEmbedUrl } from '@/lib/utils';

export default function TopicPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleOrder = parseInt(params.moduleOrder as string);
  const topicOrder = parseInt(params.topicOrder as string);

  const [activeTab, setActiveTab] = useState<'theory' | 'video'>('theory');
  const [theoryRead, setTheoryRead] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use correct store methods from your existing store
  const videoProgress = useLmsStore((state) => state.videoProgress);
  const updateVideoProgress = useLmsStore((state) => state.updateVideoProgress);

  const { data, isLoading, error } = useTopicDetails(courseSlug, moduleOrder, topicOrder);
  const updateProgress = useUpdateTopicProgress(courseSlug, moduleOrder, topicOrder);

  const topic = data?.topic;
  const progress = data?.progress;
  const nextTopic = data?.nextTopic;
  const prevTopic = data?.prevTopic;
  const courseTitle = data?.courseTitle;

  // Track theory reading
  useEffect(() => {
    if (!topic || progress?.theoryCompleted) return;

    const timer = setTimeout(() => {
      setTheoryRead(true);
      updateProgress.mutate({ theoryCompleted: true });
    }, 30000); // Mark as read after 30 seconds

    return () => clearTimeout(timer);
  }, [topic?.id, progress?.theoryCompleted]);

  // Handle scroll-based theory completion
  useEffect(() => {
    if (!topic || progress?.theoryCompleted || theoryRead) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setTheoryRead(true);
        updateProgress.mutate({ theoryCompleted: true });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [topic?.id, progress?.theoryCompleted, theoryRead]);

  // Handle video progress
  const handleVideoProgress = () => {
    if (!videoRef.current || !topic) return;

    const video = videoRef.current;
    const progressPercent = (video.currentTime / video.duration) * 100;

    // Use your existing store method
    updateVideoProgress(topic.id, {
      lessonId: topic.id,
      currentTime: video.currentTime,
      duration: video.duration,
      completed: progressPercent >= 90,
    });

    // Mark as watched if 90% completed
    if (progressPercent >= 90 && !progress?.videoWatched) {
      updateProgress.mutate({ videoWatched: true, videoProgress: 100 });
    }
  };

  const handleMarkTheoryComplete = () => {
    if (!progress?.theoryCompleted) {
      updateProgress.mutate({ theoryCompleted: true });
    }
  };

  const handleMarkVideoWatched = () => {
    if (!progress?.videoWatched) {
      updateProgress.mutate({ videoWatched: true, videoProgress: 100 });
    }
  };

  // Get current video progress as percentage
  const getVideoProgressPercent = (): number => {
    if (!topic) return 0;

    const localProgress = videoProgress[topic.id];
    if (localProgress && localProgress.duration > 0) {
      return (localProgress.currentTime / localProgress.duration) * 100;
    }

    return progress?.videoProgress ?? 0;
  };

  const currentVideoProgress = getVideoProgressPercent();

  if (isLoading) {
    return <TopicPageSkeleton />;
  }

  if (error || !topic) {
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
            {isLocked ? 'Module Locked' : 'Topic Not Found'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {isLocked
              ? 'This module is locked. Please complete the previous modules and tests to unlock it.'
              : "This topic doesn't exist or you don't have access to it."}
          </p>
          <Button asChild>
            <Link href={`/lms/${courseSlug}/module/${moduleOrder}`}>
              {isLocked ? 'Back to Module' : 'Back to Module'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = progress?.status === 'COMPLETED';
  const theoryCompleted = progress?.theoryCompleted || theoryRead;
  const videoWatched = progress?.videoWatched;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap"
        >
          <Link href="/lms" className="hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/lms/${courseSlug}`} className="hover:text-foreground">
            {courseTitle}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/lms/${courseSlug}/module/${moduleOrder}`}
            className="hover:text-foreground"
          >
            Module {moduleOrder}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Topic {topicOrder}</span>
        </motion.div>

        {/* Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Topic {topicOrder}</Badge>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
          {topic.description && (
            <p className="text-muted-foreground">{topic.description}</p>
          )}

          {/* Topic Meta */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{topic.estimatedMinutes} min read</span>
            </div>
            {topic.videoUrl && topic.videoDuration && (
              <div className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                <span>{Math.round(topic.videoDuration / 60)} min video</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {theoryCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2" />
                  )}
                  <span className={theoryCompleted ? 'text-green-600' : ''}>
                    Read Theory
                  </span>
                </div>
                {topic.videoUrl && (
                  <div className="flex items-center gap-2">
                    {videoWatched ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2" />
                    )}
                    <span className={videoWatched ? 'text-green-600' : ''}>
                      Watch Video
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'theory' | 'video')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="theory" className="gap-2">
                <FileText className="h-4 w-4" />
                Theory
                {theoryCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-2">
                <Video className="h-4 w-4" />
                Video
                {videoWatched && <CheckCircle className="h-4 w-4 text-green-600" />}
              </TabsTrigger>
            </TabsList>

            {/* Theory Content */}
            <TabsContent value="theory" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: topic.theoryContent }}
                  />

                  {!theoryCompleted && (
                    <div className="mt-8 pt-6 border-t">
                      <Button onClick={handleMarkTheoryComplete}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Video Content */}
            <TabsContent value="video" className="mt-6">
              {topic.videoUrl ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                      {getVideoEmbedUrl(topic.videoUrl || '') ? (
                        <iframe
                          src={getVideoEmbedUrl(topic.videoUrl || '')!}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={topic.title}
                        />
                      ) : (
                        <video
                          ref={videoRef}
                          src={topic.videoUrl}
                          controls
                          className="w-full h-full"
                          onTimeUpdate={handleVideoProgress}
                          poster={topic.resources?.[0]?.url}
                        />
                      )}
                    </div>

                    {/* Video Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Video Progress</span>
                        <span>{Math.round(currentVideoProgress)}%</span>
                      </div>
                      <Progress value={currentVideoProgress} />
                    </div>

                    {!videoWatched && (
                      <div className="mt-4">
                        <Button variant="outline" onClick={handleMarkVideoWatched}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Watched
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Video Content</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      There is no video tutorial available for this specific topic yet.
                      Please refer to the theory section for your learning.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setActiveTab('theory')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Switch to Theory
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Resources */}
        {topic.resources && topic.resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topic.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      {resource.type === 'pdf' ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : resource.type === 'link' ? (
                        <ExternalLink className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Download className="h-5 w-5 text-green-500" />
                      )}
                      <span className="flex-1">{resource.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between pt-4"
        >
          {prevTopic ? (
            <Button variant="outline" asChild>
              <Link
                href={`/lms/${courseSlug}/module/${moduleOrder}/topic/${prevTopic.order}`}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous: {prevTopic.title}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href={`/lms/${courseSlug}/module/${moduleOrder}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Module
              </Link>
            </Button>
          )}

          {nextTopic ? (
            <Button asChild>
              <Link
                href={`/lms/${courseSlug}/module/${moduleOrder}/topic/${nextTopic.order}`}
              >
                Next: {nextTopic.title}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/lms/${courseSlug}/module/${moduleOrder}`}>
                Complete Module
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function TopicPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-4 w-64" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}