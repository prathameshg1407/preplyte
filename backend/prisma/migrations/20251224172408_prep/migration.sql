-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLATFORM_ADMIN', 'INSTITUTE_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('QUANTITATIVE', 'VERBAL', 'LOGICAL');

-- CreateEnum
CREATE TYPE "TestCaseType" AS ENUM ('SAMPLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR');

-- CreateEnum
CREATE TYPE "AiInterviewSessionStatus" AS ENUM ('CREATED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiInterviewQuestionCategory" AS ENUM ('INTRODUCTORY', 'TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'CLOSING');

-- CreateEnum
CREATE TYPE "AiInterviewDifficulty" AS ENUM ('ENTRY', 'MID', 'SENIOR', 'LEAD');

-- CreateEnum
CREATE TYPE "MockDriveStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MockDriveModuleType" AS ENUM ('APTITUDE', 'MACHINE_CODING', 'AI_INTERVIEW');

-- CreateEnum
CREATE TYPE "MockDriveRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MockDriveBatchStatus" AS ENUM ('CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MockDriveAttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'TIMED_OUT', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MockDriveModuleAttemptStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'TIMED_OUT', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "instituteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institute_profiles" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "location" TEXT,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institute_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "resumeName" TEXT,
    "skills" TEXT[],
    "department" TEXT NOT NULL,
    "courseYear" TEXT NOT NULL,
    "marks10" DOUBLE PRECISION,
    "marks12" DOUBLE PRECISION,
    "cgpaSemesters" DOUBLE PRECISION[],
    "averageCgpa" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "parsedTextHash" TEXT,
    "lastParsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_questions" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "explanation" TEXT,
    "correctOptionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aptitude_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_options" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aptitude_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_practice_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "questionTypes" "QuestionType"[],
    "numberOfQuestions" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "totalScore" INTEGER,
    "totalCorrect" INTEGER,
    "totalWrong" INTEGER,
    "totalUnanswered" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aptitude_practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_session_questions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aptitude_session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "inputFormat" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL,
    "constraints" TEXT[],
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "type" "TestCaseType" NOT NULL DEFAULT 'HIDDEN',
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_practice_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "numberOfQuestions" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "totalScore" INTEGER,
    "totalSolved" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_session_questions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "sessionQuestionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "stdout" TEXT,
    "stderr" TEXT,
    "compileError" TEXT,
    "executionTime" DOUBLE PRECISION,
    "memoryUsed" INTEGER,
    "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
    "testCasesTotal" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "judgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programming_languages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monacoId" TEXT NOT NULL,
    "judge0Id" INTEGER NOT NULL,
    "template" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programming_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "difficulty" "AiInterviewDifficulty" NOT NULL DEFAULT 'MID',
    "focusAreas" TEXT[],
    "status" "AiInterviewSessionStatus" NOT NULL DEFAULT 'CREATED',
    "questions" JSONB,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interview_responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "category" "AiInterviewQuestionCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "questionOrder" INTEGER NOT NULL DEFAULT 0,
    "isFollowup" BOOLEAN NOT NULL DEFAULT false,
    "timeTakenSeconds" INTEGER,
    "scoresJson" JSONB,
    "feedbackText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_interview_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interview_feedbacks" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "overallSummary" TEXT NOT NULL,
    "keyStrengths" TEXT[],
    "areasForImprovement" TEXT[],
    "feedbackJson" JSONB,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_interview_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drives" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "status" "MockDriveStatus" NOT NULL DEFAULT 'DRAFT',
    "registrationStartDate" TIMESTAMP(3),
    "registrationEndDate" TIMESTAMP(3),
    "maxRegistrations" INTEGER,
    "driveStartDate" TIMESTAMP(3),
    "driveEndDate" TIMESTAMP(3),
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "showLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "showResultsImmediately" BOOLEAN NOT NULL DEFAULT false,
    "resultsReleaseDate" TIMESTAMP(3),
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT true,
    "enableProctoring" BOOLEAN NOT NULL DEFAULT false,
    "proctoringSettings" JSONB,
    "questionsGenerated" BOOLEAN NOT NULL DEFAULT false,
    "questionsGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_eligibility" (
    "id" TEXT NOT NULL,
    "mockDriveId" TEXT NOT NULL,
    "minCgpa" DOUBLE PRECISION,
    "maxCgpa" DOUBLE PRECISION,
    "minMarks10" DOUBLE PRECISION,
    "minMarks12" DOUBLE PRECISION,
    "allowedDepartments" TEXT[],
    "allowedCourseYears" TEXT[],
    "requiredSkills" TEXT[],
    "maxBacklogs" INTEGER,
    "customRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_eligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_modules" (
    "id" TEXT NOT NULL,
    "mockDriveId" TEXT NOT NULL,
    "moduleType" "MockDriveModuleType" NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT,
    "timeLimit" INTEGER NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "config" JSONB NOT NULL,
    "passingScore" DOUBLE PRECISION,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_module_questions" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "aptitudeQuestionId" TEXT,
    "machineQuestionId" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_drive_module_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_registrations" (
    "id" TEXT NOT NULL,
    "mockDriveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MockDriveRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "eligibilityCheckResult" JSONB,
    "adminNotes" TEXT,
    "batchId" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_batches" (
    "id" TEXT NOT NULL,
    "mockDriveId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "batchNumber" INTEGER NOT NULL,
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "scheduledEndTime" TIMESTAMP(3) NOT NULL,
    "status" "MockDriveBatchStatus" NOT NULL DEFAULT 'CREATED',
    "maxCapacity" INTEGER,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_attempts" (
    "id" TEXT NOT NULL,
    "mockDriveId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MockDriveAttemptStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentModuleOrder" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalScore" DOUBLE PRECISION,
    "percentageScore" DOUBLE PRECISION,
    "rank" INTEGER,
    "isPassed" BOOLEAN,
    "moduleScoresSummary" JSONB,
    "browserInfo" TEXT,
    "ipAddress" TEXT,
    "deviceInfo" JSONB,
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "suspiciousActivity" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_module_attempts" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "MockDriveModuleAttemptStatus" NOT NULL DEFAULT 'LOCKED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "isPassed" BOOLEAN,
    "moduleData" JSONB,
    "isAutoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_module_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_reports" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "overallPercentage" DOUBLE PRECISION NOT NULL,
    "overallRank" INTEGER,
    "totalParticipants" INTEGER,
    "performanceSummary" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "moduleFeedback" JSONB NOT NULL,
    "percentile" DOUBLE PRECISION,
    "comparedToAverage" DOUBLE PRECISION,
    "recommendations" TEXT[],
    "aiInsights" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_drive_leaderboard" (
    "id" TEXT NOT NULL,
    "mockDriveId" TEXT NOT NULL,
    "batchId" TEXT,
    "userId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentId" TEXT,
    "department" TEXT,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "percentageScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "moduleScores" JSONB NOT NULL,
    "totalTimeTaken" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_drive_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_instituteId_idx" ON "users"("instituteId");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "institutes_domain_key" ON "institutes"("domain");

-- CreateIndex
CREATE INDEX "institutes_domain_idx" ON "institutes"("domain");

-- CreateIndex
CREATE INDEX "institutes_isActive_idx" ON "institutes"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "institute_profiles_instituteId_key" ON "institute_profiles"("instituteId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_studentId_key" ON "student_profiles"("studentId");

-- CreateIndex
CREATE INDEX "student_profiles_studentId_idx" ON "student_profiles"("studentId");

-- CreateIndex
CREATE INDEX "student_profiles_department_idx" ON "student_profiles"("department");

-- CreateIndex
CREATE INDEX "student_profiles_courseYear_idx" ON "student_profiles"("courseYear");

-- CreateIndex
CREATE INDEX "student_profiles_averageCgpa_idx" ON "student_profiles"("averageCgpa");

-- CreateIndex
CREATE INDEX "student_profiles_department_courseYear_idx" ON "student_profiles"("department", "courseYear");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- CreateIndex
CREATE INDEX "resumes_userId_isDefault_idx" ON "resumes"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "aptitude_questions_difficulty_idx" ON "aptitude_questions"("difficulty");

-- CreateIndex
CREATE INDEX "aptitude_questions_questionType_idx" ON "aptitude_questions"("questionType");

-- CreateIndex
CREATE INDEX "aptitude_questions_isActive_idx" ON "aptitude_questions"("isActive");

-- CreateIndex
CREATE INDEX "aptitude_questions_isActive_difficulty_questionType_idx" ON "aptitude_questions"("isActive", "difficulty", "questionType");

-- CreateIndex
CREATE INDEX "aptitude_options_questionId_idx" ON "aptitude_options"("questionId");

-- CreateIndex
CREATE INDEX "aptitude_practice_sessions_userId_idx" ON "aptitude_practice_sessions"("userId");

-- CreateIndex
CREATE INDEX "aptitude_practice_sessions_userId_completedAt_idx" ON "aptitude_practice_sessions"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "aptitude_practice_sessions_expiresAt_idx" ON "aptitude_practice_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "aptitude_session_questions_sessionId_idx" ON "aptitude_session_questions"("sessionId");

-- CreateIndex
CREATE INDEX "aptitude_session_questions_sessionId_order_idx" ON "aptitude_session_questions"("sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "aptitude_session_questions_sessionId_questionId_key" ON "aptitude_session_questions"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "machine_questions_difficulty_idx" ON "machine_questions"("difficulty");

-- CreateIndex
CREATE INDEX "machine_questions_isActive_idx" ON "machine_questions"("isActive");

-- CreateIndex
CREATE INDEX "machine_questions_isActive_difficulty_idx" ON "machine_questions"("isActive", "difficulty");

-- CreateIndex
CREATE INDEX "test_cases_questionId_idx" ON "test_cases"("questionId");

-- CreateIndex
CREATE INDEX "test_cases_questionId_type_idx" ON "test_cases"("questionId", "type");

-- CreateIndex
CREATE INDEX "machine_practice_sessions_userId_idx" ON "machine_practice_sessions"("userId");

-- CreateIndex
CREATE INDEX "machine_practice_sessions_userId_completedAt_idx" ON "machine_practice_sessions"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "machine_practice_sessions_expiresAt_idx" ON "machine_practice_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "machine_session_questions_sessionId_idx" ON "machine_session_questions"("sessionId");

-- CreateIndex
CREATE INDEX "machine_session_questions_sessionId_order_idx" ON "machine_session_questions"("sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "machine_session_questions_sessionId_questionId_key" ON "machine_session_questions"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "submissions_sessionQuestionId_idx" ON "submissions"("sessionQuestionId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_sessionQuestionId_status_idx" ON "submissions"("sessionQuestionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "programming_languages_name_key" ON "programming_languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "programming_languages_monacoId_key" ON "programming_languages"("monacoId");

-- CreateIndex
CREATE UNIQUE INDEX "programming_languages_judge0Id_key" ON "programming_languages"("judge0Id");

-- CreateIndex
CREATE INDEX "programming_languages_isActive_idx" ON "programming_languages"("isActive");

-- CreateIndex
CREATE INDEX "ai_interview_sessions_userId_idx" ON "ai_interview_sessions"("userId");

-- CreateIndex
CREATE INDEX "ai_interview_sessions_userId_status_idx" ON "ai_interview_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "ai_interview_sessions_userId_createdAt_idx" ON "ai_interview_sessions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_interview_sessions_status_idx" ON "ai_interview_sessions"("status");

-- CreateIndex
CREATE INDEX "ai_interview_responses_sessionId_idx" ON "ai_interview_responses"("sessionId");

-- CreateIndex
CREATE INDEX "ai_interview_responses_sessionId_questionOrder_idx" ON "ai_interview_responses"("sessionId", "questionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ai_interview_feedbacks_sessionId_key" ON "ai_interview_feedbacks"("sessionId");

-- CreateIndex
CREATE INDEX "ai_interview_feedbacks_userId_idx" ON "ai_interview_feedbacks"("userId");

-- CreateIndex
CREATE INDEX "ai_interview_feedbacks_userId_createdAt_idx" ON "ai_interview_feedbacks"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "mock_drives_instituteId_idx" ON "mock_drives"("instituteId");

-- CreateIndex
CREATE INDEX "mock_drives_instituteId_status_idx" ON "mock_drives"("instituteId", "status");

-- CreateIndex
CREATE INDEX "mock_drives_status_idx" ON "mock_drives"("status");

-- CreateIndex
CREATE INDEX "mock_drives_registrationStartDate_registrationEndDate_idx" ON "mock_drives"("registrationStartDate", "registrationEndDate");

-- CreateIndex
CREATE INDEX "mock_drives_driveStartDate_driveEndDate_idx" ON "mock_drives"("driveStartDate", "driveEndDate");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_eligibility_mockDriveId_key" ON "mock_drive_eligibility"("mockDriveId");

-- CreateIndex
CREATE INDEX "mock_drive_modules_mockDriveId_idx" ON "mock_drive_modules"("mockDriveId");

-- CreateIndex
CREATE INDEX "mock_drive_modules_mockDriveId_moduleType_idx" ON "mock_drive_modules"("mockDriveId", "moduleType");

-- CreateIndex
CREATE INDEX "mock_drive_modules_mockDriveId_isActive_idx" ON "mock_drive_modules"("mockDriveId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_modules_mockDriveId_order_key" ON "mock_drive_modules"("mockDriveId", "order");

-- CreateIndex
CREATE INDEX "mock_drive_module_questions_moduleId_idx" ON "mock_drive_module_questions"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_module_questions_moduleId_order_key" ON "mock_drive_module_questions"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_module_questions_moduleId_aptitudeQuestionId_key" ON "mock_drive_module_questions"("moduleId", "aptitudeQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_module_questions_moduleId_machineQuestionId_key" ON "mock_drive_module_questions"("moduleId", "machineQuestionId");

-- CreateIndex
CREATE INDEX "mock_drive_registrations_mockDriveId_idx" ON "mock_drive_registrations"("mockDriveId");

-- CreateIndex
CREATE INDEX "mock_drive_registrations_mockDriveId_status_idx" ON "mock_drive_registrations"("mockDriveId", "status");

-- CreateIndex
CREATE INDEX "mock_drive_registrations_userId_idx" ON "mock_drive_registrations"("userId");

-- CreateIndex
CREATE INDEX "mock_drive_registrations_batchId_idx" ON "mock_drive_registrations"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_registrations_mockDriveId_userId_key" ON "mock_drive_registrations"("mockDriveId", "userId");

-- CreateIndex
CREATE INDEX "mock_drive_batches_mockDriveId_idx" ON "mock_drive_batches"("mockDriveId");

-- CreateIndex
CREATE INDEX "mock_drive_batches_mockDriveId_status_idx" ON "mock_drive_batches"("mockDriveId", "status");

-- CreateIndex
CREATE INDEX "mock_drive_batches_scheduledStartTime_idx" ON "mock_drive_batches"("scheduledStartTime");

-- CreateIndex
CREATE INDEX "mock_drive_batches_status_scheduledStartTime_idx" ON "mock_drive_batches"("status", "scheduledStartTime");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_batches_mockDriveId_batchNumber_key" ON "mock_drive_batches"("mockDriveId", "batchNumber");

-- CreateIndex
CREATE INDEX "mock_drive_attempts_mockDriveId_idx" ON "mock_drive_attempts"("mockDriveId");

-- CreateIndex
CREATE INDEX "mock_drive_attempts_batchId_idx" ON "mock_drive_attempts"("batchId");

-- CreateIndex
CREATE INDEX "mock_drive_attempts_userId_idx" ON "mock_drive_attempts"("userId");

-- CreateIndex
CREATE INDEX "mock_drive_attempts_mockDriveId_status_idx" ON "mock_drive_attempts"("mockDriveId", "status");

-- CreateIndex
CREATE INDEX "mock_drive_attempts_mockDriveId_rank_idx" ON "mock_drive_attempts"("mockDriveId", "rank");

-- CreateIndex
CREATE INDEX "mock_drive_attempts_batchId_status_idx" ON "mock_drive_attempts"("batchId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_attempts_batchId_userId_key" ON "mock_drive_attempts"("batchId", "userId");

-- CreateIndex
CREATE INDEX "mock_drive_module_attempts_attemptId_idx" ON "mock_drive_module_attempts"("attemptId");

-- CreateIndex
CREATE INDEX "mock_drive_module_attempts_moduleId_idx" ON "mock_drive_module_attempts"("moduleId");

-- CreateIndex
CREATE INDEX "mock_drive_module_attempts_attemptId_status_idx" ON "mock_drive_module_attempts"("attemptId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_module_attempts_attemptId_moduleId_key" ON "mock_drive_module_attempts"("attemptId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_reports_attemptId_key" ON "mock_drive_reports"("attemptId");

-- CreateIndex
CREATE INDEX "mock_drive_leaderboard_mockDriveId_idx" ON "mock_drive_leaderboard"("mockDriveId");

-- CreateIndex
CREATE INDEX "mock_drive_leaderboard_mockDriveId_batchId_idx" ON "mock_drive_leaderboard"("mockDriveId", "batchId");

-- CreateIndex
CREATE INDEX "mock_drive_leaderboard_mockDriveId_rank_idx" ON "mock_drive_leaderboard"("mockDriveId", "rank");

-- CreateIndex
CREATE INDEX "mock_drive_leaderboard_mockDriveId_batchId_rank_idx" ON "mock_drive_leaderboard"("mockDriveId", "batchId", "rank");

-- CreateIndex
CREATE INDEX "mock_drive_leaderboard_userId_idx" ON "mock_drive_leaderboard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mock_drive_leaderboard_mockDriveId_batchId_userId_key" ON "mock_drive_leaderboard"("mockDriveId", "batchId", "userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institute_profiles" ADD CONSTRAINT "institute_profiles_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aptitude_options" ADD CONSTRAINT "aptitude_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "aptitude_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aptitude_practice_sessions" ADD CONSTRAINT "aptitude_practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aptitude_session_questions" ADD CONSTRAINT "aptitude_session_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "aptitude_practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aptitude_session_questions" ADD CONSTRAINT "aptitude_session_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "aptitude_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "machine_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_practice_sessions" ADD CONSTRAINT "machine_practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_session_questions" ADD CONSTRAINT "machine_session_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "machine_practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_session_questions" ADD CONSTRAINT "machine_session_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "machine_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_sessionQuestionId_fkey" FOREIGN KEY ("sessionQuestionId") REFERENCES "machine_session_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_sessions" ADD CONSTRAINT "ai_interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_sessions" ADD CONSTRAINT "ai_interview_sessions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_responses" ADD CONSTRAINT "ai_interview_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_feedbacks" ADD CONSTRAINT "ai_interview_feedbacks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interview_feedbacks" ADD CONSTRAINT "ai_interview_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drives" ADD CONSTRAINT "mock_drives_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_eligibility" ADD CONSTRAINT "mock_drive_eligibility_mockDriveId_fkey" FOREIGN KEY ("mockDriveId") REFERENCES "mock_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_modules" ADD CONSTRAINT "mock_drive_modules_mockDriveId_fkey" FOREIGN KEY ("mockDriveId") REFERENCES "mock_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_module_questions" ADD CONSTRAINT "mock_drive_module_questions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "mock_drive_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_module_questions" ADD CONSTRAINT "mock_drive_module_questions_aptitudeQuestionId_fkey" FOREIGN KEY ("aptitudeQuestionId") REFERENCES "aptitude_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_module_questions" ADD CONSTRAINT "mock_drive_module_questions_machineQuestionId_fkey" FOREIGN KEY ("machineQuestionId") REFERENCES "machine_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_registrations" ADD CONSTRAINT "mock_drive_registrations_mockDriveId_fkey" FOREIGN KEY ("mockDriveId") REFERENCES "mock_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_registrations" ADD CONSTRAINT "mock_drive_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_registrations" ADD CONSTRAINT "mock_drive_registrations_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "mock_drive_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_batches" ADD CONSTRAINT "mock_drive_batches_mockDriveId_fkey" FOREIGN KEY ("mockDriveId") REFERENCES "mock_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_attempts" ADD CONSTRAINT "mock_drive_attempts_mockDriveId_fkey" FOREIGN KEY ("mockDriveId") REFERENCES "mock_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_attempts" ADD CONSTRAINT "mock_drive_attempts_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "mock_drive_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_attempts" ADD CONSTRAINT "mock_drive_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_module_attempts" ADD CONSTRAINT "mock_drive_module_attempts_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "mock_drive_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_module_attempts" ADD CONSTRAINT "mock_drive_module_attempts_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "mock_drive_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_reports" ADD CONSTRAINT "mock_drive_reports_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "mock_drive_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_leaderboard" ADD CONSTRAINT "mock_drive_leaderboard_mockDriveId_fkey" FOREIGN KEY ("mockDriveId") REFERENCES "mock_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_leaderboard" ADD CONSTRAINT "mock_drive_leaderboard_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "mock_drive_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_drive_leaderboard" ADD CONSTRAINT "mock_drive_leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
