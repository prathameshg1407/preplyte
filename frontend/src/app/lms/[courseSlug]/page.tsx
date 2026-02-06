// src/app/lms/[courseSlug]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Users,
  Star,
  ChevronRight,
  AlertCircle,
  X,
} from 'lucide-react';
import { useCourseDetails, useEnrollCourse } from '@/lib/hooks/lms/use-lms';
import { LmsModuleStatus } from '@/types/lms.types';
import { getVideoEmbedUrl } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  EASY: 'Beginner',
  MEDIUM: 'Intermediate',
  HARD: 'Advanced',
};

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;

  const { data, isLoading, error } = useCourseDetails(courseSlug);
  const enrollMutation = useEnrollCourse();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const course = data?.course;
  const modules = data?.modules || [];
  const enrollment = data?.enrollment;
  const finalTest = data?.finalTest;

  const handleEnroll = async () => {
    await enrollMutation.mutateAsync(courseSlug);
  };

  const getModuleStatus = (moduleOrder: number) => {
    if (!enrollment) return 'locked';
    const moduleProgress = modules.find((m) => m.order === moduleOrder)?.progress;
    return moduleProgress?.status || 'LOCKED';
  };

  const canAccessModule = (moduleOrder: number) => {
    if (!enrollment) return false;
    if (moduleOrder === 1) return true;
    const prevModule = modules.find((m) => m.order === moduleOrder - 1);
    return prevModule?.progress?.status === 'COMPLETED';
  };

  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/lms">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const isFree = course.price === 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/lms" className="hover:text-foreground">
                Courses
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/lms?category=${course.category?.slug}`}
                className="hover:text-foreground"
              >
                {course.category?.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{course.title}</span>
            </div>

            <div className="flex items-start gap-2 mb-2">
              <Badge className={difficultyColors[course.difficulty]}>
                {difficultyLabels[course.difficulty]}
              </Badge>
              {enrollment && <Badge variant="secondary">Enrolled</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{course.shortDescription}</p>

            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {course.instructor && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>By {course.instructor}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalModules} Modules</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.totalHours} Hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{course.totalPoints} Points</span>
              </div>
            </div>
          </motion.div>

          {/* Course Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>About this Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Modules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Course Content</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {course.totalModules} modules • {course.totalTopics} topics
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {modules.map((module) => {
                    const status = module.progress?.status || 'LOCKED';
                    const isLocked = !enrollment || (module.order > 1 && !canAccessModule(module.order));
                    const isCompleted = status === 'COMPLETED';
                    const isInProgress = status === 'IN_PROGRESS';

                    return (
                      <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${isCompleted
                                ? 'bg-green-100 text-green-600'
                                : isInProgress
                                  ? 'bg-blue-100 text-blue-600'
                                  : isLocked
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-primary/10 text-primary'
                                }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : isLocked ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <span className="text-sm font-medium">{module.order}</span>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{module.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-3">
                                <span>{module.totalTopics} topics</span>
                                <span>•</span>
                                <span>{module.estimatedMinutes} min</span>
                                <span>•</span>
                                <span>{module.points} pts</span>
                              </div>
                            </div>
                            {module.progress && (
                              <div className="text-right mr-4">
                                <div className="text-sm font-medium">
                                  {Math.round(module.progress.progressPercent)}%
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <p className="text-sm text-muted-foreground">
                              {module.shortDescription}
                            </p>

                            {/* Topics List */}
                            {module.topics && module.topics.length > 0 && (
                              <div className="space-y-2">
                                {module.topics.map((topic) => {
                                  const topicCompleted =
                                    topic.progress?.status === 'COMPLETED';
                                  return (
                                    <div
                                      key={topic.id}
                                      className="flex items-center gap-2 text-sm py-1"
                                    >
                                      {topicCompleted ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <div className="h-4 w-4 rounded-full border" />
                                      )}
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <span>{topic.title}</span>
                                      {topic.videoUrl && (
                                        <Video className="h-4 w-4 text-muted-foreground ml-auto" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Module Test Info */}
                            {module.moduleTest && (
                              <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted rounded-lg">
                                <Trophy className="h-4 w-4 text-orange-500" />
                                <span>Module Test: {module.moduleTest.totalQuestions} questions</span>
                                <span className="text-muted-foreground">
                                  ({module.moduleTest.timeLimitMinutes} min)
                                </span>
                              </div>
                            )}

                            {/* Action Button */}
                            {enrollment && !isLocked && (
                              <Button
                                variant={isCompleted ? 'outline' : 'default'}
                                size="sm"
                                asChild
                              >
                                <Link href={`/lms/${courseSlug}/module/${module.order}`}>
                                  {isCompleted
                                    ? 'Review Module'
                                    : isInProgress
                                      ? 'Continue Learning'
                                      : 'Start Module'}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                {/* Final Test */}
                {finalTest && (
                  <div className="mt-4 p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Final Assessment</div>
                        <div className="text-sm text-muted-foreground">
                          {finalTest.totalQuestions} questions • {finalTest.timeLimitMinutes} min •{' '}
                          {finalTest.totalPoints} pts
                        </div>
                      </div>
                      {enrollment?.finalTestAttempted && (
                        <Badge variant={enrollment.finalTestPassed ? 'default' : 'destructive'}>
                          {enrollment.finalTestPassed
                            ? `Passed (${enrollment.finalTestScore}%)`
                            : 'Not Passed'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete all modules to unlock the final assessment. You only have one
                      attempt!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-20"
          >
            <Card>
              {/* Course Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                {course.previewVideoUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Price */}
                <div className="text-center">
                  {isFree ? (
                    <div className="text-3xl font-bold text-green-600">Free</div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold">
                        {course.currency} {hasDiscount ? course.discountPrice : course.price}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-muted-foreground line-through">
                          {course.currency} {course.price}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Enrollment Progress */}
                {enrollment && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {Math.round(enrollment.progressPercent)}%
                        </span>
                      </div>
                      <Progress value={enrollment.progressPercent} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{enrollment.completedModules}</div>
                        <div className="text-xs text-muted-foreground">
                          of {course.totalModules} modules
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{enrollment.totalPointsEarned}</div>
                        <div className="text-xs text-muted-foreground">
                          of {course.totalPoints} points
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )}

                {/* CTA Button */}
                {enrollment ? (
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/lms/${courseSlug}/module/1`}>
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      'Enrolling...'
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </Button>
                )}

                {/* Course Includes */}
                <div className="space-y-3 pt-4">
                  <h4 className="font-medium">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {course.totalHours} hours of video content
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {course.totalTopics} detailed topics
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {course.totalModules} module tests + final exam
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {course.totalPoints} total points to earn
                    </li>
                    {course.certificateEnabled && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Certificate of completion
                      </li>
                    )}
                  </ul>
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Skills you'll learn:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full relative">
            {course.previewVideoUrl && (
              getVideoEmbedUrl(course.previewVideoUrl) ? (
                <iframe
                  src={getVideoEmbedUrl(course.previewVideoUrl)! + "&autoplay=1"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={course.previewVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )
            )}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CourseDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    </div>
  );
}