// src/module/lms/lms.types.ts

import {
  LmsCourseStatus,
  LmsEnrollmentStatus,
  LmsModuleStatus,
  LmsTopicStatus,
  LmsTestType,
  LmsTestAttemptStatus,
  DifficultyLevel,
} from '@prisma/client';

export interface FeedbackResponse {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

// =====================================================
// REQUEST TYPES
// =====================================================

export interface GetCoursesQuery {
  page?: number;
  limit?: number;
  categorySlug?: string;
  difficulty?: DifficultyLevel;
  search?: string;
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
  priceRange?: 'free' | 'paid' | 'all';
}

export interface UpdateTopicProgressBody {
  theoryCompleted?: boolean;
  videoWatched?: boolean;
  videoProgress?: number;
  timeSpentMinutes?: number;
}

export interface SubmitTestAnswerBody {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitTestBody {
  answers: SubmitTestAnswerBody[];
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  order: number;
  isActive: boolean;
  coursesCount: number;
}

export interface CourseCardResponse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  totalModules: number;
  totalPoints: number;
  totalHours: number;
  price: number;
  discountPrice: number | null;
  currency: string;
  difficulty: DifficultyLevel;
  instructor: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isEnrolled: boolean;
  enrollmentProgress?: number;
  averageRating: number;
  ratingsCount: number;
  enrollmentCount: number; // NEW: Total number of enrollments
}

export interface CoursesListResponse {
  courses: CourseCardResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ModuleResponse {
  id: string;
  courseId: string;
  title: string;
  shortDescription: string;
  description: string | null;
  order: number;
  totalTopics: number;
  points: number;
  estimatedMinutes: number;
  isActive: boolean;
  topics?: TopicResponse[];
  moduleTest?: ModuleTestResponse | null;
  progress?: ModuleProgressResponse | null;
}

export interface TopicResponse {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  order: number;
  theoryContent: string;
  videoUrl: string | null;
  videoDuration: number | null;
  estimatedMinutes: number;
  resources: TopicResource[] | null;
  isActive: boolean;
  progress?: TopicProgressResponse | null;
}

export interface TopicResource {
  name: string;
  url: string;
  type: 'pdf' | 'link' | 'file';
}

export interface ModuleTestResponse {
  id: string;
  moduleId: string;
  title: string;
  instructions: string | null;
  totalQuestions: number;
  passingScore: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  pointsPerQuestion: number;
  totalPoints: number;
  isActive: boolean;
}

export interface FinalTestResponse {
  id: string;
  courseId: string;
  title: string;
  instructions: string | null;
  totalQuestions: number;
  passingScore: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  pointsPerQuestion: number;
  totalPoints: number;
  isActive: boolean;
}

export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  status: LmsEnrollmentStatus;
  completedModules: number;
  completedTopics: number;
  progressPercent: number;
  totalPointsEarned: number;
  moduleTestPointsEarned: number;
  finalTestPointsEarned: number;
  finalTestAttempted: boolean;
  finalTestPassed: boolean;
  finalTestScore: number | null;
  finalTestMarks: number | null;
  hasGivenFeedback: boolean;
  enrolledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
  certificateUrl: string | null;
  certificateIssuedAt: Date | null;
}

export interface ModuleProgressResponse {
  id: string;
  userId: string;
  moduleId: string;
  status: LmsModuleStatus;
  completedTopics: number;
  totalTopics: number;
  progressPercent: number;
  testAttempted: boolean;
  testPassed: boolean;
  testScore: number | null;
  testAttempts: number;
  pointsEarned: number;
  timeSpentMinutes: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface TopicProgressResponse {
  id: string;
  userId: string;
  topicId: string;
  status: LmsTopicStatus;
  theoryCompleted: boolean;
  videoWatched: boolean;
  videoProgress: number;
  timeSpentMinutes: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface CourseDetailsResponse {
  course: {
    id: string;
    categoryId: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    thumbnailUrl: string | null;
    previewVideoUrl: string | null;
    totalModules: number;
    totalTopics: number;
    totalPoints: number;
    totalHours: number;
    price: number;
    discountPrice: number | null;
    currency: string;
    status: LmsCourseStatus;
    isActive: boolean;
    certificateEnabled: boolean;
    passingPercentage: number;
    tags: string[];
    difficulty: DifficultyLevel;
    instructor: string | null;
    language: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    category: CategoryResponse;
    averageRating: number;
    ratingsCount: number;
    feedbacks: FeedbackResponse[];
    enrollmentCount: number; // NEW: Total number of enrollments
  };
  modules: ModuleResponse[];
  enrollment: EnrollmentResponse | null;
  finalTest: FinalTestResponse | null;
}

export interface ModuleDetailsResponse {
  module: ModuleResponse;
  topics: TopicResponse[];
  moduleTest: ModuleTestResponse | null;
  progress: ModuleProgressResponse | null;
  courseTitle: string;
  courseSlug: string;
}

export interface TopicDetailsResponse {
  topic: TopicResponse;
  progress: TopicProgressResponse | null;
  nextTopic: { id: string; title: string; order: number } | null;
  prevTopic: { id: string; title: string; order: number } | null;
  moduleTitle: string;
  courseTitle: string;
  courseSlug: string;
  moduleOrder: number;
}

export interface TestQuestionResponse {
  id: string;
  questionText: string;
  order: number;
  points: number;
  options: {
    id: string;
    text: string;
    order: number;
  }[];
}

export interface StartTestResponse {
  attempt: {
    id: string;
    testType: LmsTestType;
    status: LmsTestAttemptStatus;
    attemptNumber: number;
    totalQuestions: number;
    timeLimitMinutes: number;
    startedAt: Date;
    expiresAt: Date;
  };
  questions: TestQuestionResponse[];
}

export interface SubmitTestResponse {
  attempt: {
    id: string;
    testType: LmsTestType;
    status: LmsTestAttemptStatus;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    score: number;
    pointsEarned: number;
    marksObtained: number;
    totalMarks: number;
    isPassed: boolean;
    timeSpentSeconds: number;
    completedAt: Date;
  };
  pointsEarned: number;
  passed: boolean;
  message: string;
  hasGivenFeedback?: boolean;
}

export interface LmsStatsResponse {
  totalCourses: number;
  totalInstructors: number;
  totalStudents: number;
  averageCompletionRate: number;
}

export interface UserDashboardResponse {
  enrolledCourses: (EnrollmentResponse & { course: CourseCardResponse })[];
  recentlyAccessed: CourseCardResponse[];
  completedCourses: number;
  inProgressCourses: number;
  totalPointsEarned: number;
  certificatesEarned: number;
}