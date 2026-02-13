// src/components/lms/course-card.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Award, Star } from 'lucide-react';
import type { LmsCourseCard } from '@/types/lms.types';

interface CourseCardProps {
  course: LmsCourseCard;
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const difficultyLabels = {
  EASY: 'Beginner',
  MEDIUM: 'Intermediate',
  HARD: 'Advanced',
};

export function CourseCard({ course }: CourseCardProps) {
  const hasDiscount = !!(course.discountPrice && course.discountPrice > 0);
  const finalPrice = hasDiscount ? course.price - (course.discountPrice || 0) : course.price;
  const isFree = finalPrice <= 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={difficultyColors[course.difficulty]}>
            {difficultyLabels[course.difficulty]}
          </Badge>
        </div>
        {course.isEnrolled && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">Enrolled</Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Category */}
        <div className="text-xs text-muted-foreground">{course.category.name}</div>

        {/* Title */}
        <h3 className="font-semibold line-clamp-2 leading-tight">{course.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.shortDescription}
        </p>

        {/* Instructor */}
        {course.instructor && (
          <p className="text-xs text-muted-foreground">By {course.instructor}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{course.totalModules} modules</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{course.totalHours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{course.totalPoints} pts</span>
          </div>
          {course.averageRating !== undefined && course.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{course.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Enrollment Progress */}
        {course.isEnrolled && course.enrollmentProgress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(course.enrollmentProgress)}%</span>
            </div>
            <Progress value={course.enrollmentProgress} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Price */}
        <div className="flex items-center gap-2">
          {isFree ? (
            <span className="text-lg font-bold text-green-600">Free</span>
          ) : (
            <>
              <span className="text-lg font-bold">
                {course.currency} {finalPrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {course.currency} {course.price}
                </span>
              )}
            </>
          )}
        </div>

        {/* Action Button */}
        <Button size="sm" asChild>
          <Link href={`/lms/${course.slug}`}>
            {course.isEnrolled ? 'Continue' : 'View Course'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}