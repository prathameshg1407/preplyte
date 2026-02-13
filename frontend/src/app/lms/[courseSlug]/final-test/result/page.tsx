// src/app/lms/[courseSlug]/final-test/result/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Award,
  Download,
  Share2,
  BookOpen,
  Star,
  Medal,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useState } from 'react';
import { lmsService } from '@/lib/api/services/lms.service';
import { FeedbackModal } from '@/components/lms/feedback-modal';
export default function FinalTestResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const courseSlug = params.courseSlug as string;

  const passed = searchParams.get('passed') === 'true';
  const score = parseFloat(searchParams.get('score') || '0');
  const points = parseInt(searchParams.get('points') || '0');
  const marks = parseInt(searchParams.get('marks') || '0');
  const totalMarks = parseInt(searchParams.get('total') || '0');

  useEffect(() => {
    if (passed) {
      // Celebration confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [passed]);

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', label: 'Excellent' };
    if (score >= 80) return { grade: 'A', color: 'text-green-500', label: 'Very Good' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-500', label: 'Good' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-500', label: 'Satisfactory' };
    return { grade: 'F', color: 'text-red-500', label: 'Needs Improvement' };
  };

  const gradeInfo = getGrade(score);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);


  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);

  // Check if user has given feedback from URL param or local state
  // ideally we should fetch from server, but for now we rely on the URL param passed from the test submission response
  // or we can fetch course details here. 
  // Let's assume the previous page passed 'hasGivenFeedback' in URL, but wait, useSearchParams only gets strings.
  // The 'passed' param comes from the router.push in final-test/page.tsx.

  // We need to fetch the course details to know if feedback is given, OR pass it in URL.
  // Ideally, the submitTest response should have returned it, and we should have passed it here.
  // But since we are here now, let's just use a simple state for now, assuming the user just finished.
  // Wait, if they refresh, the modal might pop up again if we don't check server.

  // Let's look at how we got here. In final-test/page.tsx, we did router.push.
  // We should update final-test/page.tsx to include hasGivenFeedback in URL if possible, OR
  // fetch it here.

  // Let's fetch the course details to be sure.
  useEffect(() => {
    async function checkFeedbackStatus() {
      if (passed) {
        const hasFeedbackParam = searchParams.get('hasFeedback') === 'true';

        if (hasFeedbackParam) {
          setHasGivenFeedback(true);
          setShowFeedbackModal(false);
          return;
        }

        try {
          const data = await lmsService.getCourseBySlug(courseSlug);
          if (data.enrollment?.hasGivenFeedback) {
            setHasGivenFeedback(true);
            setShowFeedbackModal(false);
          } else {
            setShowFeedbackModal(true);
          }
        } catch (e) {
          console.error("Failed to check feedback status", e);
          // If fetch fails, we still show the modal as the final test was passed
          setShowFeedbackModal(true);
        }
      }
    }
    checkFeedbackStatus();
  }, [courseSlug, passed, searchParams]);

  return (
    <div className="container mx-auto px-4 py-12">
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setHasGivenFeedback(true);
        }}
        courseSlug={courseSlug}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`text-center ${passed ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}`}>
            <CardHeader className="pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-4 ${passed
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : 'bg-gradient-to-br from-red-400 to-red-600'
                  }`}
              >
                {passed ? (
                  <Trophy className="h-12 w-12 text-white" />
                ) : (
                  <XCircle className="h-12 w-12 text-white" />
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl mb-2">
                  {passed ? '🎉 Congratulations!' : 'Test Completed'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {passed
                    ? 'You have successfully completed the course!'
                    : 'Unfortunately, you did not meet the passing requirements.'}
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className={`text-7xl font-bold ${gradeInfo.color}`}>
                    {score.toFixed(0)}%
                  </div>
                  <div className="text-left">
                    <div className={`text-4xl font-bold ${gradeInfo.color}`}>
                      {gradeInfo.grade}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {gradeInfo.label}
                    </div>
                  </div>
                </div>

                <Progress
                  value={score}
                  className={`h-4 ${passed ? '' : '[&>div]:bg-red-500'}`}
                />

                <div className="flex justify-center">
                  <Badge
                    variant={passed ? 'default' : 'destructive'}
                    className="text-base px-4 py-1"
                  >
                    {passed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Passed
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Not Passed
                      </>
                    )}
                  </Badge>
                </div>
              </motion.div>

              <Separator />

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="p-4 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                  <div className="text-2xl font-bold">{marks}</div>
                  <div className="text-xs text-muted-foreground">of {totalMarks} marks</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Award className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold">{points}</div>
                  <div className="text-xs text-muted-foreground">Points Earned</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Medal className="h-5 w-5 mx-auto text-orange-500 mb-2" />
                  <div className="text-2xl font-bold">{gradeInfo.grade}</div>
                  <div className="text-xs text-muted-foreground">Grade</div>
                </div>
              </motion.div>

              {/* Certificate Section (if passed) */}
              {passed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <Star className="h-7 w-7 text-yellow-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-lg">Certificate Unlocked!</h3>
                      <p className="text-sm text-muted-foreground">
                        Download your certificate of completion
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                {passed ? (
                  <>
                    <Button size="lg" className="flex-1" asChild>
                      <Link href="/lms">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Explore More Courses
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Achievement
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" className="flex-1" asChild>
                      <Link href={`/lms/${courseSlug}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review Course Material
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1" asChild>
                      <Link href="/lms">
                        Browse Other Courses
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>

              {!passed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-muted-foreground"
                >
                  Note: The final test can only be taken once. Consider reviewing the course
                  material and exploring other courses to strengthen your skills.
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Completion Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {passed ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Download className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Download Certificate</div>
                        <div className="text-sm text-muted-foreground">
                          Add it to your resume and LinkedIn profile
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Share2 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Share Your Achievement</div>
                        <div className="text-sm text-muted-foreground">
                          Let others know about your accomplishment
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Continue Learning</div>
                        <div className="text-sm text-muted-foreground">
                          Explore advanced courses to level up your skills
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Review Course Material</div>
                        <div className="text-sm text-muted-foreground">
                          Go through the modules again to strengthen concepts
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Try Related Courses</div>
                        <div className="text-sm text-muted-foreground">
                          Build foundational skills with beginner courses
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}