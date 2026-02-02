-- CreateEnum
CREATE TYPE "LmsCourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LmsEnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LmsModuleStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LmsTopicStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LmsTestType" AS ENUM ('MODULE_TEST', 'FINAL_TEST');

-- CreateEnum
CREATE TYPE "LmsTestAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT');

-- CreateTable
CREATE TABLE "lms_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_courses" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "previewVideoUrl" TEXT,
    "totalModules" INTEGER NOT NULL DEFAULT 0,
    "totalTopics" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "LmsCourseStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "certificateEnabled" BOOLEAN NOT NULL DEFAULT true,
    "passingPercentage" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "tags" TEXT[],
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "instructor" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "lms_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "totalTopics" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_topics" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "theoryContent" TEXT NOT NULL,
    "videoUrl" TEXT,
    "videoDuration" INTEGER,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 10,
    "resources" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_module_tests" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "passingScore" INTEGER NOT NULL DEFAULT 60,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 30,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "pointsPerQuestion" INTEGER NOT NULL DEFAULT 10,
    "totalPoints" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_module_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_final_tests" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "totalQuestions" INTEGER NOT NULL DEFAULT 50,
    "passingScore" INTEGER NOT NULL DEFAULT 60,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 120,
    "pointsPerQuestion" INTEGER NOT NULL DEFAULT 10,
    "totalPoints" INTEGER NOT NULL DEFAULT 500,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_final_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_test_questions" (
    "id" TEXT NOT NULL,
    "moduleTestId" TEXT,
    "finalTestId" TEXT,
    "questionText" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_test_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_test_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "LmsEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedModules" INTEGER NOT NULL DEFAULT 0,
    "completedTopics" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "moduleTestPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "finalTestPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "finalTestAttempted" BOOLEAN NOT NULL DEFAULT false,
    "finalTestPassed" BOOLEAN NOT NULL DEFAULT false,
    "finalTestScore" DOUBLE PRECISION,
    "finalTestMarks" INTEGER,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "certificateIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_module_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "LmsModuleStatus" NOT NULL DEFAULT 'LOCKED',
    "completedTopics" INTEGER NOT NULL DEFAULT 0,
    "totalTopics" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "testAttempted" BOOLEAN NOT NULL DEFAULT false,
    "testPassed" BOOLEAN NOT NULL DEFAULT false,
    "testScore" DOUBLE PRECISION,
    "testAttempts" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_module_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "LmsTopicStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "theoryCompleted" BOOLEAN NOT NULL DEFAULT false,
    "videoWatched" BOOLEAN NOT NULL DEFAULT false,
    "videoProgress" INTEGER NOT NULL DEFAULT 0,
    "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_test_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleTestId" TEXT,
    "finalTestId" TEXT,
    "testType" "LmsTestType" NOT NULL,
    "status" "LmsTestAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "unanswered" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "marksObtained" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_test_responses" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_test_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lms_categories_name_key" ON "lms_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lms_categories_slug_key" ON "lms_categories"("slug");

-- CreateIndex
CREATE INDEX "lms_categories_isActive_idx" ON "lms_categories"("isActive");

-- CreateIndex
CREATE INDEX "lms_categories_slug_idx" ON "lms_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lms_courses_slug_key" ON "lms_courses"("slug");

-- CreateIndex
CREATE INDEX "lms_courses_categoryId_idx" ON "lms_courses"("categoryId");

-- CreateIndex
CREATE INDEX "lms_courses_status_isActive_idx" ON "lms_courses"("status", "isActive");

-- CreateIndex
CREATE INDEX "lms_courses_slug_idx" ON "lms_courses"("slug");

-- CreateIndex
CREATE INDEX "lms_courses_price_idx" ON "lms_courses"("price");

-- CreateIndex
CREATE INDEX "lms_courses_difficulty_idx" ON "lms_courses"("difficulty");

-- CreateIndex
CREATE INDEX "lms_modules_courseId_idx" ON "lms_modules"("courseId");

-- CreateIndex
CREATE INDEX "lms_modules_courseId_isActive_idx" ON "lms_modules"("courseId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "lms_modules_courseId_order_key" ON "lms_modules"("courseId", "order");

-- CreateIndex
CREATE INDEX "lms_topics_moduleId_idx" ON "lms_topics"("moduleId");

-- CreateIndex
CREATE INDEX "lms_topics_moduleId_isActive_idx" ON "lms_topics"("moduleId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "lms_topics_moduleId_order_key" ON "lms_topics"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lms_module_tests_moduleId_key" ON "lms_module_tests"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "lms_final_tests_courseId_key" ON "lms_final_tests"("courseId");

-- CreateIndex
CREATE INDEX "lms_test_questions_moduleTestId_idx" ON "lms_test_questions"("moduleTestId");

-- CreateIndex
CREATE INDEX "lms_test_questions_finalTestId_idx" ON "lms_test_questions"("finalTestId");

-- CreateIndex
CREATE INDEX "lms_test_questions_moduleTestId_order_idx" ON "lms_test_questions"("moduleTestId", "order");

-- CreateIndex
CREATE INDEX "lms_test_questions_finalTestId_order_idx" ON "lms_test_questions"("finalTestId", "order");

-- CreateIndex
CREATE INDEX "lms_test_options_questionId_idx" ON "lms_test_options"("questionId");

-- CreateIndex
CREATE INDEX "lms_enrollments_userId_idx" ON "lms_enrollments"("userId");

-- CreateIndex
CREATE INDEX "lms_enrollments_courseId_idx" ON "lms_enrollments"("courseId");

-- CreateIndex
CREATE INDEX "lms_enrollments_userId_status_idx" ON "lms_enrollments"("userId", "status");

-- CreateIndex
CREATE INDEX "lms_enrollments_courseId_status_idx" ON "lms_enrollments"("courseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lms_enrollments_userId_courseId_key" ON "lms_enrollments"("userId", "courseId");

-- CreateIndex
CREATE INDEX "lms_module_progress_userId_idx" ON "lms_module_progress"("userId");

-- CreateIndex
CREATE INDEX "lms_module_progress_moduleId_idx" ON "lms_module_progress"("moduleId");

-- CreateIndex
CREATE INDEX "lms_module_progress_userId_status_idx" ON "lms_module_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lms_module_progress_userId_moduleId_key" ON "lms_module_progress"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "lms_topic_progress_userId_idx" ON "lms_topic_progress"("userId");

-- CreateIndex
CREATE INDEX "lms_topic_progress_topicId_idx" ON "lms_topic_progress"("topicId");

-- CreateIndex
CREATE INDEX "lms_topic_progress_userId_status_idx" ON "lms_topic_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lms_topic_progress_userId_topicId_key" ON "lms_topic_progress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "lms_test_attempts_userId_idx" ON "lms_test_attempts"("userId");

-- CreateIndex
CREATE INDEX "lms_test_attempts_moduleTestId_idx" ON "lms_test_attempts"("moduleTestId");

-- CreateIndex
CREATE INDEX "lms_test_attempts_finalTestId_idx" ON "lms_test_attempts"("finalTestId");

-- CreateIndex
CREATE INDEX "lms_test_attempts_userId_moduleTestId_idx" ON "lms_test_attempts"("userId", "moduleTestId");

-- CreateIndex
CREATE INDEX "lms_test_attempts_userId_finalTestId_idx" ON "lms_test_attempts"("userId", "finalTestId");

-- CreateIndex
CREATE INDEX "lms_test_attempts_status_idx" ON "lms_test_attempts"("status");

-- CreateIndex
CREATE INDEX "lms_test_responses_attemptId_idx" ON "lms_test_responses"("attemptId");

-- CreateIndex
CREATE INDEX "lms_test_responses_questionId_idx" ON "lms_test_responses"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "lms_test_responses_attemptId_questionId_key" ON "lms_test_responses"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "lms_courses" ADD CONSTRAINT "lms_courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "lms_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_modules" ADD CONSTRAINT "lms_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_topics" ADD CONSTRAINT "lms_topics_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "lms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_module_tests" ADD CONSTRAINT "lms_module_tests_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "lms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_final_tests" ADD CONSTRAINT "lms_final_tests_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_questions" ADD CONSTRAINT "lms_test_questions_moduleTestId_fkey" FOREIGN KEY ("moduleTestId") REFERENCES "lms_module_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_questions" ADD CONSTRAINT "lms_test_questions_finalTestId_fkey" FOREIGN KEY ("finalTestId") REFERENCES "lms_final_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_options" ADD CONSTRAINT "lms_test_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "lms_test_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_enrollments" ADD CONSTRAINT "lms_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_enrollments" ADD CONSTRAINT "lms_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_module_progress" ADD CONSTRAINT "lms_module_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_module_progress" ADD CONSTRAINT "lms_module_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "lms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_topic_progress" ADD CONSTRAINT "lms_topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_topic_progress" ADD CONSTRAINT "lms_topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "lms_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_attempts" ADD CONSTRAINT "lms_test_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_attempts" ADD CONSTRAINT "lms_test_attempts_moduleTestId_fkey" FOREIGN KEY ("moduleTestId") REFERENCES "lms_module_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_attempts" ADD CONSTRAINT "lms_test_attempts_finalTestId_fkey" FOREIGN KEY ("finalTestId") REFERENCES "lms_final_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_responses" ADD CONSTRAINT "lms_test_responses_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "lms_test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_test_responses" ADD CONSTRAINT "lms_test_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "lms_test_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
