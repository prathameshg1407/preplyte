// src/types/lms.types.ts

// Enums matching Prisma schema
export enum LmsCourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum LmsEnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  EXPIRED = 'EXPIRED',
}

export enum LmsModuleStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum LmsTopicStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum LmsTestType {
  MODULE_TEST = 'MODULE_TEST',
  FINAL_TEST = 'FINAL_TEST',
}

export enum LmsTestAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TIMED_OUT = 'TIMED_OUT',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// Category
export interface LmsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  order: number;
  isActive: boolean;
  coursesCount?: number;
}

// Course
export interface LmsCourse {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  totalModules: number;
  totalTopics: number;
  totalPoints: number;
  totalHours: number;
  price: number;
  discountPrice?: number;
  currency: string;
  status: LmsCourseStatus;
  isActive: boolean;
  certificateEnabled: boolean;
  passingPercentage: number;
  tags: string[];
  difficulty: DifficultyLevel;
  instructor?: string;
  language: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: LmsCategory;
  modules?: LmsModule[];
  enrollment?: LmsEnrollment;
}

// Course Card (for listing)
export interface LmsCourseCard {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl?: string;
  totalModules: number;
  totalPoints: number;
  totalHours: number;
  price: number;
  discountPrice?: number;
  currency: string;
  difficulty: DifficultyLevel;
  instructor?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isEnrolled: boolean;
  enrollmentProgress?: number;
}

// Module
export interface LmsModule {
  id: string;
  courseId: string;
  title: string;
  shortDescription: string;
  description?: string;
  order: number;
  totalTopics: number;
  points: number;
  estimatedMinutes: number;
  isActive: boolean;
  topics?: LmsTopic[];
  moduleTest?: LmsModuleTest;
  progress?: LmsModuleProgress;
}

// Topic
export interface LmsTopic {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  theoryContent: string;
  videoUrl?: string;
  videoDuration?: number;
  estimatedMinutes: number;
  resources?: TopicResource[];
  isActive: boolean;
  progress?: LmsTopicProgress;
}

export interface TopicResource {
  name: string;
  url: string;
  type: 'pdf' | 'link' | 'file';
}

// Tests
export interface LmsModuleTest {
  id: string;
  moduleId: string;
  title: string;
  instructions?: string;
  totalQuestions: number;
  passingScore: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  pointsPerQuestion: number;
  totalPoints: number;
  isActive: boolean;
  questions?: LmsTestQuestion[];
}

export interface LmsFinalTest {
  id: string;
  courseId: string;
  title: string;
  instructions?: string;
  totalQuestions: number;
  passingScore: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  pointsPerQuestion: number;
  totalPoints: number;
  isActive: boolean;
  questions?: LmsTestQuestion[];
}

export interface LmsTestQuestion {
  id: string;
  moduleTestId?: string;
  finalTestId?: string;
  questionText: string;
  explanation?: string;
  order: number;
  points: number;
  isActive: boolean;
  options: LmsTestOption[];
}

export interface LmsTestOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

// Progress Tracking
export interface LmsEnrollment {
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
  finalTestScore?: number;
  finalTestMarks?: number;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  certificateUrl?: string;
  certificateIssuedAt?: string;
}

export interface LmsModuleProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: LmsModuleStatus;
  completedTopics: number;
  totalTopics: number;
  progressPercent: number;
  testAttempted: boolean;
  testPassed: boolean;
  testScore?: number;
  testAttempts: number;
  pointsEarned: number;
  timeSpentMinutes: number;
  startedAt?: string;
  completedAt?: string;
}

export interface LmsTopicProgress {
  id: string;
  userId: string;
  topicId: string;
  status: LmsTopicStatus;
  theoryCompleted: boolean;
  videoWatched: boolean;
  videoProgress: number;
  timeSpentMinutes: number;
  startedAt?: string;
  completedAt?: string;
}

// Test Attempts
export interface LmsTestAttempt {
  id: string;
  userId: string;
  moduleTestId?: string;
  finalTestId?: string;
  testType: LmsTestType;
  status: LmsTestAttemptStatus;
  attemptNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  pointsEarned: number;
  marksObtained: number;
  totalMarks: number;
  isPassed: boolean;
  timeLimitMinutes: number;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  responses?: LmsTestResponse[];
}

export interface LmsTestResponse {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect?: boolean;
  pointsAwarded: number;
  answeredAt?: string;
}

// API Request/Response Types
export interface GetCoursesParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  difficulty?: string;
  search?: string;
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
  priceRange?: 'free' | 'paid' | 'all';
}

export interface GetCoursesResponse {
  courses: LmsCourseCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CourseDetailsResponse {
  course: LmsCourse;
  modules: LmsModule[];
  enrollment?: LmsEnrollment;
  finalTest?: LmsFinalTest;
}

export interface ModuleDetailsResponse {
  module: LmsModule;
  topics: LmsTopic[];
  moduleTest?: LmsModuleTest;
  progress?: LmsModuleProgress;
  courseTitle: string;
  courseSlug: string;
}

export interface TopicDetailsResponse {
  topic: LmsTopic;
  progress?: LmsTopicProgress;
  nextTopic?: { id: string; title: string; order: number };
  prevTopic?: { id: string; title: string; order: number };
  moduleTitle: string;
  courseTitle: string;
  courseSlug: string;
  moduleOrder: number;
}

export interface EnrollCourseResponse {
  enrollment: LmsEnrollment;
  message: string;
}

export interface StartTestResponse {
  attempt: LmsTestAttempt;
  questions: LmsTestQuestion[];
}

export interface SubmitTestResponse {
  attempt: LmsTestAttempt;
  pointsEarned: number;
  passed: boolean;
  message: string;
}

export interface UpdateTopicProgressRequest {
  theoryCompleted?: boolean;
  videoWatched?: boolean;
  videoProgress?: number;
  timeSpentMinutes?: number;
}

export interface SubmitTestAnswerRequest {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitTestRequest {
  answers: SubmitTestAnswerRequest[];
}

// Course Stats for Landing Page
export interface LmsStats {
  totalCourses: number;
  totalInstructors: number;
  totalStudents: number;
  averageCompletionRate: number;
}

// User's Learning Dashboard
export interface LmsUserDashboard {
  enrolledCourses: LmsEnrollment[];
  recentlyAccessed: LmsCourseCard[];
  completedCourses: number;
  inProgressCourses: number;
  totalPointsEarned: number;
  certificatesEarned: number;
}