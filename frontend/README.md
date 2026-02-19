// prisma/schema.prisma

// =====================================================
// GENERATOR & DATASOURCE
// =====================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =====================================================
// ENUMS - CORE
// =====================================================

enum UserRole {
  PLATFORM_ADMIN
  INSTITUTE_ADMIN
  USER
}

enum DifficultyLevel {
  EASY
  MEDIUM
  HARD
}

enum QuestionType {
  QUANTITATIVE
  VERBAL
  LOGICAL
}

enum TestCaseType {
  SAMPLE
  HIDDEN
}

enum SubmissionStatus {
  PENDING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT_EXCEEDED
  MEMORY_LIMIT_EXCEEDED
  RUNTIME_ERROR
  COMPILATION_ERROR
}

// =====================================================
// ENUMS - AI INTERVIEW
// =====================================================

enum AiInterviewSessionStatus {
  CREATED
  STARTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  FAILED
}

enum AiInterviewQuestionCategory {
  INTRODUCTORY
  TECHNICAL
  BEHAVIORAL
  SITUATIONAL
  CLOSING
}

enum AiInterviewDifficulty {
  ENTRY
  MID
  SENIOR
  LEAD
}

// =====================================================
// ENUMS - MOCKDRIVE
// =====================================================

enum MockDriveStatus {
  DRAFT
  PUBLISHED
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum MockDriveModuleType {
  APTITUDE
  MACHINE_CODING
  AI_INTERVIEW
}

enum MockDriveRegistrationStatus {
  PENDING
  APPROVED
  REJECTED
  WITHDRAWN
}

enum MockDriveBatchStatus {
  CREATED
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum MockDriveAttemptStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  TIMED_OUT
  ABANDONED
}

enum MockDriveModuleAttemptStatus {
  LOCKED
  AVAILABLE
  IN_PROGRESS
  COMPLETED
  TIMED_OUT
  SKIPPED
}

// =====================================================
// USER & AUTHENTICATION
// =====================================================

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String?
  role        UserRole @default(USER)
  isActive    Boolean  @default(true)
  instituteId String?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastLoginAt  DateTime?
  tokenVersion Int       @default(0)

  // Relations
  institute        Institute?                @relation(fields: [instituteId], references: [id], onDelete: SetNull)
  refreshTokens    RefreshToken[]
  profile          StudentProfile?
  resumes          Resume[]
  
  // Practice Sessions
  aptitudeSessions AptitudePracticeSession[]
  machineSessions  MachinePracticeSession[]

  // AI Interview
  aiInterviewSessions  AiInterviewSession[]
  aiInterviewFeedbacks AiInterviewFeedback[]

  // MockDrive
  mockDriveRegistrations MockDriveRegistration[]
  mockDriveAttempts      MockDriveAttempt[]
  mockDriveLeaderboard   MockDriveLeaderboard[]

  @@index([email])
  @@index([instituteId])
  @@index([role, isActive])
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  expiresAt DateTime
  revokedAt DateTime?
  userAgent String?
  ipAddress String?

  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// =====================================================
// INSTITUTE
// =====================================================

model Institute {
  id       String  @id @default(cuid())
  name     String
  domain   String  @unique
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  users      User[]
  profile    InstituteProfile?
  mockDrives MockDrive[]

  @@index([domain])
  @@index([isActive])
  @@map("institutes")
}

model InstituteProfile {
  id          String @id @default(cuid())
  instituteId String @unique

  logoUrl       String?
  location      String?
  totalStudents Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  institute Institute @relation(fields: [instituteId], references: [id], onDelete: Cascade)

  @@map("institute_profiles")
}

// =====================================================
// STUDENT PROFILE
// =====================================================

model StudentProfile {
  id        String @id @default(cuid())
  userId    String @unique
  fullName  String
  studentId String @unique

  resumeUrl  String?
  resumeName String?

  skills String[]

  department String
  courseYear String

  marks10       Float?
  marks12       Float?
  cgpaSemesters Float[]
  averageCgpa   Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([studentId])
  @@index([department])
  @@index([courseYear])
  @@index([averageCgpa])
  @@index([department, courseYear])
  @@map("student_profiles")
}

// =====================================================
// RESUME
// =====================================================

model Resume {
  id        String  @id @default(cuid())
  userId    String
  fileName  String
  fileUrl   String
  fileSize  Int?
  mimeType  String?
  isDefault Boolean @default(false)

  parsedTextHash String?
  lastParsedAt   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user                User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  aiInterviewSessions AiInterviewSession[]

  @@index([userId])
  @@index([userId, isDefault])
  @@map("resumes")
}

// =====================================================
// APTITUDE - QUESTION BANK
// =====================================================

model AptitudeQuestion {
  id              String          @id @default(cuid())
  questionText    String          @db.Text
  questionType    QuestionType
  difficulty      DifficultyLevel
  explanation     String?         @db.Text
  correctOptionId String
  isActive        Boolean         @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  options                  AptitudeOption[]
  sessionQuestions         AptitudeSessionQuestion[]
  mockDriveModuleQuestions MockDriveModuleQuestion[]

  @@index([difficulty])
  @@index([questionType])
  @@index([isActive])
  @@index([isActive, difficulty, questionType])
  @@map("aptitude_questions")
}

model AptitudeOption {
  id         String @id @default(cuid())
  text       String
  questionId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  question AptitudeQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("aptitude_options")
}

// =====================================================
// APTITUDE - PRACTICE SESSION
// =====================================================

model AptitudePracticeSession {
  id                String          @id @default(cuid())
  userId            String
  difficulty        DifficultyLevel
  questionTypes     QuestionType[]
  numberOfQuestions Int
  timeLimit         Int

  startedAt   DateTime  @default(now())
  completedAt DateTime?
  expiresAt   DateTime

  totalScore      Int?
  totalCorrect    Int?
  totalWrong      Int?
  totalUnanswered Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user             User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionQuestions AptitudeSessionQuestion[]

  @@index([userId])
  @@index([userId, completedAt])
  @@index([expiresAt])
  @@map("aptitude_practice_sessions")
}

model AptitudeSessionQuestion {
  id               String    @id @default(cuid())
  sessionId        String
  questionId       String
  order            Int       @default(0)
  selectedOptionId String?
  isCorrect        Boolean?
  answeredAt       DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  session  AptitudePracticeSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question AptitudeQuestion        @relation(fields: [questionId], references: [id], onDelete: Restrict)

  @@unique([sessionId, questionId])
  @@index([sessionId])
  @@index([sessionId, order])
  @@map("aptitude_session_questions")
}

// =====================================================
// MACHINE CODING - QUESTION BANK
// =====================================================

model MachineQuestion {
  id           String          @id @default(cuid())
  title        String
  description  String          @db.Text
  difficulty   DifficultyLevel @default(MEDIUM)
  inputFormat  String          @db.Text
  outputFormat String          @db.Text
  constraints  String[]
  tags         String[]
  isActive     Boolean         @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  testCases                TestCase[]
  sessionQuestions         MachineSessionQuestion[]
  mockDriveModuleQuestions MockDriveModuleQuestion[]

  @@index([difficulty])
  @@index([isActive])
  @@index([isActive, difficulty])
  @@map("machine_questions")
}

model TestCase {
  id             String       @id @default(cuid())
  type           TestCaseType @default(HIDDEN)
  input          String       @db.Text
  expectedOutput String       @db.Text
  order          Int          @default(0)
  questionId     String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  question MachineQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@index([questionId, type])
  @@map("test_cases")
}

// =====================================================
// MACHINE CODING - PRACTICE SESSION
// =====================================================

model MachinePracticeSession {
  id                String          @id @default(cuid())
  userId            String
  difficulty        DifficultyLevel
  numberOfQuestions Int
  timeLimit         Int

  startedAt   DateTime  @default(now())
  completedAt DateTime?
  expiresAt   DateTime

  totalScore  Int?
  totalSolved Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user             User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionQuestions MachineSessionQuestion[]

  @@index([userId])
  @@index([userId, completedAt])
  @@index([expiresAt])
  @@map("machine_practice_sessions")
}

model MachineSessionQuestion {
  id         String  @id @default(cuid())
  sessionId  String
  questionId String
  order      Int     @default(0)
  isSolved   Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  session     MachinePracticeSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question    MachineQuestion        @relation(fields: [questionId], references: [id], onDelete: Restrict)
  submissions Submission[]

  @@unique([sessionId, questionId])
  @@index([sessionId])
  @@index([sessionId, order])
  @@map("machine_session_questions")
}

// =====================================================
// SUBMISSIONS
// =====================================================

model Submission {
  id                String           @id @default(cuid())
  sessionQuestionId String
  code              String           @db.Text
  languageId        Int
  status            SubmissionStatus @default(PENDING)

  stdout       String? @db.Text
  stderr       String? @db.Text
  compileError String? @db.Text

  executionTime Float?
  memoryUsed    Int?

  testCasesPassed Int @default(0)
  testCasesTotal  Int @default(0)

  submittedAt DateTime  @default(now())
  judgedAt    DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessionQuestion MachineSessionQuestion @relation(fields: [sessionQuestionId], references: [id], onDelete: Cascade)

  @@index([sessionQuestionId])
  @@index([status])
  @@index([sessionQuestionId, status])
  @@map("submissions")
}

// =====================================================
// PROGRAMMING LANGUAGES
// =====================================================

model ProgrammingLanguage {
  id       String  @id @default(cuid())
  name     String  @unique
  monacoId String  @unique
  judge0Id Int     @unique
  template String  @db.Text
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive])
  @@map("programming_languages")
}

// =====================================================
// AI INTERVIEW - SESSION
// =====================================================

model AiInterviewSession {
  id       String @id @default(cuid())
  userId   String
  resumeId String?

  // Configuration
  jobTitle    String?
  companyName String?
  difficulty  AiInterviewDifficulty @default(MID)
  focusAreas  String[]

  // State
  status AiInterviewSessionStatus @default(CREATED)

  // Questions (JSON array)
  questions Json?

  // Progress
  totalQuestions       Int @default(10)
  currentQuestionIndex Int @default(0)

  // Timestamps
  startedAt   DateTime?
  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume    Resume?               @relation(fields: [resumeId], references: [id], onDelete: SetNull)
  responses AiInterviewResponse[]
  feedback  AiInterviewFeedback?

  @@index([userId])
  @@index([userId, status])
  @@index([userId, createdAt])
  @@index([status])
  @@map("ai_interview_sessions")
}

// =====================================================
// AI INTERVIEW - RESPONSE
// =====================================================

model AiInterviewResponse {
  id        String @id @default(cuid())
  sessionId String

  category AiInterviewQuestionCategory
  question String                      @db.Text
  answer   String                      @db.Text

  questionOrder    Int     @default(0)
  isFollowup       Boolean @default(false)
  timeTakenSeconds Int?

  // Scoring (JSON for flexibility)
  scoresJson   Json?
  feedbackText String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  session AiInterviewSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([sessionId, questionOrder])
  @@map("ai_interview_responses")
}

// =====================================================
// AI INTERVIEW - FEEDBACK
// =====================================================

model AiInterviewFeedback {
  id        String @id @default(cuid())
  sessionId String @unique
  userId    String

  overallScore   Decimal @db.Decimal(5, 2)
  overallSummary String  @db.Text

  keyStrengths        String[]
  areasForImprovement String[]

  feedbackJson Json?
  generatedBy  String @default("ai")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  session AiInterviewSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user    User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
  @@map("ai_interview_feedbacks")
}

// =====================================================
// MOCKDRIVE - MAIN CONFIGURATION
// =====================================================

model MockDrive {
  id          String @id @default(cuid())
  instituteId String

  // Basic Info
  title        String
  description  String? @db.Text
  instructions String? @db.Text

  // Status
  status MockDriveStatus @default(DRAFT)

  // Registration
  registrationStartDate DateTime?
  registrationEndDate   DateTime?
  maxRegistrations      Int?

  // Drive Timing
  driveStartDate DateTime?
  driveEndDate   DateTime?

  // Settings
  allowLateSubmission    Boolean @default(false)
  showLeaderboard        Boolean @default(true)
  showResultsImmediately Boolean @default(false)
  resultsReleaseDate     DateTime?
  shuffleQuestions       Boolean @default(true)

  // Proctoring
  enableProctoring   Boolean @default(false)
  proctoringSettings Json?

  // Question Generation Flag
  questionsGenerated   Boolean   @default(false)
  questionsGeneratedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  institute           Institute                @relation(fields: [instituteId], references: [id], onDelete: Cascade)
  eligibilityCriteria MockDriveEligibility?
  modules             MockDriveModule[]
  registrations       MockDriveRegistration[]
  batches             MockDriveBatch[]
  attempts            MockDriveAttempt[]
  leaderboard         MockDriveLeaderboard[]

  @@index([instituteId])
  @@index([instituteId, status])
  @@index([status])
  @@index([registrationStartDate, registrationEndDate])
  @@index([driveStartDate, driveEndDate])
  @@map("mock_drives")
}

// =====================================================
// MOCKDRIVE - ELIGIBILITY CRITERIA
// =====================================================

model MockDriveEligibility {
  id          String @id @default(cuid())
  mockDriveId String @unique

  // CGPA
  minCgpa Float?
  maxCgpa Float?

  // Academic Marks
  minMarks10 Float?
  minMarks12 Float?

  // Filters (empty = all allowed)
  allowedDepartmentIds String[]
  allowedCourseYears String[]
  requiredSkills     String[] // Student must have at least one

  // Backlogs
  maxBacklogs Int?

  // Custom Rules (JSON for flexibility)
  // Structure: { rules: Array<{ field: string, operator: string, value: any }> }
  customRules Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mockDrive MockDrive @relation(fields: [mockDriveId], references: [id], onDelete: Cascade)

  @@map("mock_drive_eligibility")
}

// =====================================================
// MOCKDRIVE - MODULE CONFIGURATION
// =====================================================

model MockDriveModule {
  id          String              @id @default(cuid())
  mockDriveId String
  moduleType  MockDriveModuleType
  order       Int
  name        String?
  timeLimit   Int                 // in minutes
  weightage   Float               @default(100)

  // Module-specific configuration (JSON)
  // ═══════════════════════════════════════════════════
  // APTITUDE:
  // {
  //   difficulty: DifficultyLevel,
  //   questionTypes: QuestionType[],
  //   numberOfQuestions: number,
  //   marksPerQuestion: number,
  //   negativeMarking: number
  // }
  // ═══════════════════════════════════════════════════
  // MACHINE_CODING:
  // {
  //   difficulty: DifficultyLevel,
  //   numberOfQuestions: number,
  //   allowedLanguages: string[],
  //   partialScoring: boolean,
  //   maxScorePerQuestion: number
  // }
  // ═══════════════════════════════════════════════════
  // AI_INTERVIEW:
  // {
  //   difficulty: AiInterviewDifficulty,
  //   jobTitle: string,
  //   companyName?: string,
  //   focusAreas: string[],
  //   targetQuestions: number
  // }
  // ═══════════════════════════════════════════════════
  config Json

  passingScore Float?
  instructions String? @db.Text
  isActive     Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mockDrive       MockDrive                  @relation(fields: [mockDriveId], references: [id], onDelete: Cascade)
  moduleQuestions MockDriveModuleQuestion[]
  moduleAttempts  MockDriveModuleAttempt[]

  @@unique([mockDriveId, order])
  @@index([mockDriveId])
  @@index([mockDriveId, moduleType])
  @@index([mockDriveId, isActive])
  @@map("mock_drive_modules")
}

// =====================================================
// MOCKDRIVE - PRE-SELECTED QUESTIONS
// (Generated when MockDrive is published)
// =====================================================

model MockDriveModuleQuestion {
  id       String @id @default(cuid())
  moduleId String

  // Polymorphic reference (only one will be set based on module type)
  aptitudeQuestionId String?
  machineQuestionId  String?

  // Order for consistent display
  order Int

  createdAt DateTime @default(now())

  module           MockDriveModule   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  aptitudeQuestion AptitudeQuestion? @relation(fields: [aptitudeQuestionId], references: [id], onDelete: Cascade)
  machineQuestion  MachineQuestion?  @relation(fields: [machineQuestionId], references: [id], onDelete: Cascade)

  @@unique([moduleId, order])
  @@unique([moduleId, aptitudeQuestionId])
  @@unique([moduleId, machineQuestionId])
  @@index([moduleId])
  @@map("mock_drive_module_questions")
}

// =====================================================
// MOCKDRIVE - REGISTRATION
// =====================================================

model MockDriveRegistration {
  id          String                      @id @default(cuid())
  mockDriveId String
  userId      String
  status      MockDriveRegistrationStatus @default(PENDING)

  // Eligibility check result (stored for audit)
  // Structure: {
  //   isEligible: boolean,
  //   checks: Array<{ criterion: string, passed: boolean, details: string }>
  // }
  eligibilityCheckResult Json?

  adminNotes String?
  batchId    String?

  registeredAt DateTime  @default(now())
  reviewedAt   DateTime?
  reviewedBy   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mockDrive MockDrive       @relation(fields: [mockDriveId], references: [id], onDelete: Cascade)
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  batch     MockDriveBatch? @relation(fields: [batchId], references: [id], onDelete: SetNull)

  @@unique([mockDriveId, userId])
  @@index([mockDriveId])
  @@index([mockDriveId, status])
  @@index([userId])
  @@index([batchId])
  @@map("mock_drive_registrations")
}

// =====================================================
// MOCKDRIVE - BATCH MANAGEMENT
// =====================================================

model MockDriveBatch {
  id          String @id @default(cuid())
  mockDriveId String

  name        String
  batchNumber Int

  scheduledStartTime DateTime
  scheduledEndTime   DateTime

  status MockDriveBatchStatus @default(CREATED)

  maxCapacity     Int?
  isAutoGenerated Boolean @default(false)
  notes           String?

  actualStartTime DateTime?
  actualEndTime   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mockDrive     MockDrive               @relation(fields: [mockDriveId], references: [id], onDelete: Cascade)
  registrations MockDriveRegistration[]
  attempts      MockDriveAttempt[]
  leaderboard   MockDriveLeaderboard[]

  @@unique([mockDriveId, batchNumber])
  @@index([mockDriveId])
  @@index([mockDriveId, status])
  @@index([scheduledStartTime])
  @@index([status, scheduledStartTime])
  @@map("mock_drive_batches")
}

// =====================================================
// MOCKDRIVE - STUDENT ATTEMPT
// =====================================================

model MockDriveAttempt {
  id          String                 @id @default(cuid())
  mockDriveId String
  batchId     String
  userId      String
  status      MockDriveAttemptStatus @default(NOT_STARTED)

  currentModuleOrder Int @default(0)

  startedAt   DateTime?
  completedAt DateTime?

  // Scores (calculated after completion)
  totalScore      Float?
  percentageScore Float?
  rank            Int?
  isPassed        Boolean?

  // Module-wise summary (denormalized)
  // Structure: Array<{ moduleId, moduleType, score, maxScore, percentage, passed }>
  moduleScoresSummary Json?

  // Proctoring
  browserInfo        String?
  ipAddress          String?
  deviceInfo         Json?
  tabSwitchCount     Int     @default(0)
  suspiciousActivity Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mockDrive      MockDrive                @relation(fields: [mockDriveId], references: [id], onDelete: Cascade)
  batch          MockDriveBatch           @relation(fields: [batchId], references: [id], onDelete: Cascade)
  user           User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  moduleAttempts MockDriveModuleAttempt[]
  report         MockDriveReport?

  @@unique([batchId, userId])
  @@index([mockDriveId])
  @@index([batchId])
  @@index([userId])
  @@index([mockDriveId, status])
  @@index([mockDriveId, rank])
  @@index([batchId, status])
  @@map("mock_drive_attempts")
}

// =====================================================
// MOCKDRIVE - MODULE ATTEMPT
// =====================================================

model MockDriveModuleAttempt {
  id        String                       @id @default(cuid())
  attemptId String
  moduleId  String
  status    MockDriveModuleAttemptStatus @default(LOCKED)

  startedAt   DateTime?
  completedAt DateTime?
  expiresAt   DateTime?

  timeSpentSeconds Int @default(0)

  score      Float?
  maxScore   Float?
  percentage Float?
  isPassed   Boolean?

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE DATA (JSON) - Stores all attempt data
  // ═══════════════════════════════════════════════════════════════════════
  //
  // APTITUDE:
  // {
  //   questions: Array<{
  //     questionId: string,           // MockDriveModuleQuestion.id
  //     aptitudeQuestionId: string,   // AptitudeQuestion.id
  //     displayOrder: number,         // Shuffled order for this student
  //     selectedOptionId: string | null,
  //     isCorrect: boolean | null,
  //     timeSpentSeconds: number,
  //     answeredAt: string | null     // ISO datetime
  //   }>,
  //   summary: {
  //     totalQuestions: number,
  //     totalCorrect: number,
  //     totalWrong: number,
  //     totalUnanswered: number,
  //     marksObtained: number,
  //     negativeMarks: number,
  //     finalScore: number,
  //     maxScore: number
  //   }
  // }
  //
  // ═══════════════════════════════════════════════════════════════════════
  //
  // MACHINE_CODING:
  // {
  //   questions: Array<{
  //     questionId: string,           // MockDriveModuleQuestion.id
  //     machineQuestionId: string,    // MachineQuestion.id
  //     displayOrder: number,
  //     submissions: Array<{
  //       id: string,
  //       code: string,
  //       languageId: number,
  //       languageName: string,
  //       status: SubmissionStatus,
  //       testCasesPassed: number,
  //       testCasesTotal: number,
  //       executionTime: number | null,
  //       memoryUsed: number | null,
  //       stdout: string | null,
  //       stderr: string | null,
  //       compileError: string | null,
  //       submittedAt: string         // ISO datetime
  //     }>,
  //     bestSubmissionId: string | null,
  //     bestScore: number,
  //     isSolved: boolean
  //   }>,
  //   summary: {
  //     totalQuestions: number,
  //     totalSolved: number,
  //     totalPartial: number,
  //     totalUnattempted: number,
  //     totalScore: number,
  //     maxScore: number
  //   }
  // }
  //
  // ═══════════════════════════════════════════════════════════════════════
  //
  // AI_INTERVIEW:
  // {
  //   config: {
  //     resumeId: string,
  //     resumeUrl: string,
  //     jobTitle: string,
  //     companyName: string | null,
  //     difficulty: AiInterviewDifficulty,
  //     focusAreas: string[],
  //     targetQuestions: number
  //   },
  //   conversation: Array<{
  //     id: string,
  //     role: 'assistant' | 'user',
  //     content: string,
  //     timestamp: string             // ISO datetime
  //   }>,
  //   responses: Array<{
  //     id: string,
  //     questionIndex: number,
  //     category: AiInterviewQuestionCategory,
  //     question: string,
  //     answer: string,
  //     isFollowup: boolean,
  //     scores: {
  //       relevance: number,
  //       clarity: number,
  //       depth: number,
  //       technicalAccuracy: number | null,
  //       overall: number
  //     },
  //     feedback: string,
  //     timeTakenSeconds: number,
  //     answeredAt: string            // ISO datetime
  //   }>,
  //   summary: {
  //     totalQuestions: number,
  //     questionsAnswered: number,
  //     overallScore: number,
  //     maxScore: number,
  //     categoryScores: {
  //       INTRODUCTORY: { score: number, count: number },
  //       TECHNICAL: { score: number, count: number },
  //       BEHAVIORAL: { score: number, count: number },
  //       SITUATIONAL: { score: number, count: number },
  //       CLOSING: { score: number, count: number }
  //     },
  //     keyStrengths: string[],
  //     areasForImprovement: string[],
  //     overallFeedback: string
  //   }
  // }
  //
  // ═══════════════════════════════════════════════════════════════════════
  moduleData Json?

  isAutoSubmitted Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  attempt MockDriveAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  module  MockDriveModule  @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([attemptId, moduleId])
  @@index([attemptId])
  @@index([moduleId])
  @@index([attemptId, status])
  @@map("mock_drive_module_attempts")
}

// =====================================================
// MOCKDRIVE - DETAILED REPORT
// =====================================================

model MockDriveReport {
  id        String @id @default(cuid())
  attemptId String @unique

  overallScore      Float
  overallPercentage Float
  overallRank       Int?
  totalParticipants Int?

  performanceSummary String @db.Text

  strengths  String[]
  weaknesses String[]

  // Module-wise detailed feedback (JSON)
  // Structure: Array<{
  //   moduleId: string,
  //   moduleName: string,
  //   moduleType: MockDriveModuleType,
  //   score: number,
  //   maxScore: number,
  //   percentage: number,
  //   rank?: number,
  //   feedback: string,
  //   detailedAnalysis: {
  //     // APTITUDE: questionTypeWiseAnalysis, difficultyWiseAnalysis
  //     // MACHINE_CODING: problemWiseAnalysis, languageUsed
  //     // AI_INTERVIEW: categoryWiseScores, communicationScore
  //   },
  //   recommendations: string[]
  // }>
  moduleFeedback Json

  percentile        Float?
  comparedToAverage Float?

  recommendations String[]
  aiInsights      String? @db.Text

  generatedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt

  attempt MockDriveAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  @@map("mock_drive_reports")
}

// =====================================================
// MOCKDRIVE - LEADERBOARD (Cached/Materialized)
// =====================================================

model MockDriveLeaderboard {
  id          String  @id @default(cuid())
  mockDriveId String
  batchId     String? // Null = overall mockdrive leaderboard
  userId      String

  // Denormalized student info
  studentName String
  studentId   String?
  department  String?

  totalScore      Float
  percentageScore Float
  rank            Int

  // Module-wise scores (JSON)
  // Structure: Array<{ moduleId, moduleType, moduleName, score, maxScore, percentage }>
  moduleScores Json

  totalTimeTaken Int? // seconds
  completedAt    DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  mockDrive MockDrive       @relation(fields: [mockDriveId], references: [id], onDelete: Cascade)
  batch     MockDriveBatch? @relation(fields: [batchId], references: [id], onDelete: Cascade)
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([mockDriveId, batchId, userId])
  @@index([mockDriveId])
  @@index([mockDriveId, batchId])
  @@index([mockDriveId, rank])
  @@index([mockDriveId, batchId, rank])
  @@index([userId])
  @@map("mock_drive_leaderboard")
}


┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOCKDRIVE LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CREATION (Institute Admin)                                              │
│     ├── Configure modules (Aptitude, Machine, AI Interview)                 │
│     ├── Set time limits per module                                          │
│     ├── Set eligibility criteria (CGPA, department, year, skills)           │
│     └── Set registration deadline                                           │
│                                                                             │
│  2. REGISTRATION (Eligible Students)                                        │
│     ├── Students check eligibility                                          │
│     ├── Register for mockdrive                                              │
│     └── Wait for batch assignment                                           │
│                                                                             │
│  3. BATCH MANAGEMENT (Institute Admin)                                      │
│     ├── Auto-create batches OR manual creation                              │
│     ├── Assign students to batches                                          │
│     ├── Set batch scheduled time                                            │
│     └── Students notified of their slot                                     │
│                                                                             │
│  4. EXECUTION (Students at scheduled time)                                  │
│     ├── Click "Start MockDrive"                                             │
│     ├── Module 1 appears → Complete/Auto-submit on timeout                  │
│     ├── Module 2 appears → Complete/Auto-submit on timeout                  │
│     ├── Module 3 appears → Complete/Auto-submit on timeout                  │
│     └── MockDrive completed                                                 │
│                                                                             │
│  5. RESULTS & ANALYTICS                                                     │
│     ├── Student: Detailed report with scores & feedback per module          │
│     ├── Institute: All students' scores, analytics                          │
│     └── Leaderboard: Ranking within batch/mockdrive                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘



┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  MOCKDRIVE SYSTEM ERD                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

Institute
    │
    │ 1:N
    ▼
MockDrive ─────────────────┬──────────────────┬─────────────────┬─────────────────────────
    │                      │                  │                 │
    │ 1:1                  │ 1:N              │ 1:N             │ 1:N
    ▼                      ▼                  ▼                 ▼
MockDriveEligibility   MockDriveModule   MockDriveBatch   MockDriveRegistration
                           │                  │                 │
                           │                  │ 1:N             │ N:1
                           │                  ▼                 │
                           │           MockDriveAttempt ◄───────┘
                           │                  │
                           │ N:1              │ 1:N
                           │                  ▼
                           └────────► MockDriveModuleAttempt
                                             │
                                             │ 1:1
                                             ▼
                                    (moduleData JSON stores
                                     references to actual
                                     session data)

MockDriveAttempt
    │
    │ 1:1
    ▼
MockDriveReport

MockDrive + MockDriveBatch
    │
    │ Aggregated
    ▼
MockDriveLeaderboard (Cached/Materialized)



D:\PREPLYTE\BACKEND\SRC\MODULE
│
├───instituteadmin
│   └───mock-drive
│       │   index.ts
│       │   mockdrive.controller.ts
│       │   mockdrive.routes.ts
│       │   mockdrive.service.ts
│       │   mockdrive.types.ts
│       │   mockdrive.validation.ts
│       │
│       ├───analytics
│       │       analytics.controller.ts
│       │       analytics.service.ts
│       │       analytics.types.ts
│       │       index.ts
│       │
│       ├───batch
│       │       batch.controller.ts
│       │       batch.service.ts
│       │       batch.types.ts
│       │       batch.validation.ts
│       │       index.ts
│       │
│       ├───eligibility
│       │       eligibility.controller.ts
│       │       eligibility.service.ts
│       │       eligibility.types.ts
│       │       eligibility.validation.ts
│       │       index.ts
│       │
│       ├───modules
│       │       index.ts
│       │       modules.controller.ts
│       │       modules.service.ts
│       │       modules.types.ts
│       │       modules.validation.ts
│       │
│       ├───registration
│       │       index.ts
│       │       registration.controller.ts
│       │       registration.service.ts
│       │       registration.types.ts
│       │       registration.validation.ts
│       │
│       └───results
│               index.ts
│               results.controller.ts
│               results.service.ts
│               results.types.ts
│
└───mock-drive
    │   index.ts
    │
    ├───attempt
    │   │   attempt.controller.ts
    │   │   attempt.service.ts
    │   │   attempt.types.ts
    │   │   attempt.validation.ts
    │   │   index.ts
    │   │
    │   └───executors
    │           aptitude.executor.ts
    │           base.executor.ts
    │           index.ts
    │           interview.executor.ts
    │           machine.executor.ts
    │
    ├───discovery
    │       discovery.controller.ts
    │       discovery.service.ts
    │       discovery.types.ts
    │       discovery.validation.ts
    │       index.ts
    │
    ├───leaderboard
    │       index.ts
    │       leaderboard.controller.ts
    │       leaderboard.service.ts
    │       leaderboard.types.ts
    │
    ├───results
    │       index.ts
    │       results.controller.ts
    │       results.service.ts
    │       results.types.ts
    │
    ├───shared
    │       index.ts
    │       mockdrive.constants.ts
    │       mockdrive.shared-types.ts
    │
    └───utils
            eligibility.utils.ts
            index.ts
            report-generator.ts
            scoring.utils.ts
            time.utils.ts



            Institute Admin Module (instituteadmin/mock-drive/)
File/Folder	Responsibility
mockdrive.controller.ts	CRUD operations for MockDrive (create, update, delete, list, publish)
mockdrive.service.ts	Business logic for MockDrive management
mockdrive.routes.ts	Route definitions for all institute admin endpoints
mockdrive.validation.ts	Zod schemas for request validation
mockdrive.types.ts	TypeScript interfaces and types
eligibility/	Manage eligibility criteria (CGPA, department, skills, etc.)
modules/	Configure modules (add/edit/remove aptitude, machine, interview modules)
registration/	View/approve/reject student registrations
batch/	Create batches, assign students, schedule times, auto-batch creation
analytics/	Dashboard stats, completion rates, score distributions
results/	View all student results, export data
Student Module (mock-drive/)
File/Folder	Responsibility
discovery/	List available mockdrives, check eligibility, register
attempt/	Start mockdrive, handle module flow, submit responses
attempt/executors/	Execute each module type (reuse existing practice services)
results/	View personal detailed report and feedback
leaderboard/	View rankings within batch/mockdrive
shared/	Constants, shared types used across modules
utils/	Scoring calculations, eligibility checks, time management, report generation



POST   /api/institute/mock-drive                    # Create mockdrive
GET    /api/institute/mock-drive                    # List all mockdrives
GET    /api/institute/mock-drive/:id                # Get mockdrive details
PUT    /api/institute/mock-drive/:id                # Update mockdrive
DELETE /api/institute/mock-drive/:id                # Delete mockdrive
POST   /api/institute/mock-drive/:id/publish        # Publish mockdrive

# Eligibility
PUT    /api/institute/mock-drive/:id/eligibility    # Set eligibility criteria
GET    /api/institute/mock-drive/:id/eligibility    # Get eligibility criteria

# Modules
POST   /api/institute/mock-drive/:id/modules        # Add module
PUT    /api/institute/mock-drive/:id/modules/:moduleId  # Update module
DELETE /api/institute/mock-drive/:id/modules/:moduleId  # Remove module
PUT    /api/institute/mock-drive/:id/modules/reorder    # Reorder modules

# Registrations
GET    /api/institute/mock-drive/:id/registrations           # List registrations
PUT    /api/institute/mock-drive/:id/registrations/:regId    # Approve/Reject
POST   /api/institute/mock-drive/:id/registrations/bulk      # Bulk approve/reject

# Batches
POST   /api/institute/mock-drive/:id/batches              # Create batch
GET    /api/institute/mock-drive/:id/batches              # List batches
PUT    /api/institute/mock-drive/:id/batches/:batchId     # Update batch
DELETE /api/institute/mock-drive/:id/batches/:batchId     # Delete batch
POST   /api/institute/mock-drive/:id/batches/auto-create  # Auto-create batches
POST   /api/institute/mock-drive/:id/batches/:batchId/assign-students  # Assign students

# Analytics
GET    /api/institute/mock-drive/:id/analytics            # Overall analytics
GET    /api/institute/mock-drive/:id/analytics/batches    # Batch-wise analytics

# Results
GET    /api/institute/mock-drive/:id/results              # All student results
GET    /api/institute/mock-drive/:id/results/export       # Export results (CSV/Excel)
GET    /api/institute/mock-drive/:id/leaderboard          # Full leaderboard



# Discovery & Registration
GET    /api/mock-drive                              # List available mockdrives
GET    /api/mock-drive/:id                          # Get mockdrive details
GET    /api/mock-drive/:id/eligibility-check        # Check my eligibility
POST   /api/mock-drive/:id/register                 # Register for mockdrive
DELETE /api/mock-drive/:id/register                 # Withdraw registration
GET    /api/mock-drive/my-registrations             # My registered mockdrives

# Attempt
GET    /api/mock-drive/:id/my-attempt               # Get my attempt status
POST   /api/mock-drive/:id/start                    # Start mockdrive
GET    /api/mock-drive/:id/current-module           # Get current module
POST   /api/mock-drive/:id/modules/:moduleId/start  # Start specific module
POST   /api/mock-drive/:id/modules/:moduleId/submit # Submit module (or auto-submit)

# Module-specific (during attempt)
POST   /api/mock-drive/:id/modules/:moduleId/aptitude/answer    # Submit aptitude answer
POST   /api/mock-drive/:id/modules/:moduleId/machine/submit     # Submit code
POST   /api/mock-drive/:id/modules/:moduleId/interview/respond  # Submit interview response

# Results
GET    /api/mock-drive/:id/my-result                # Get my detailed result
GET    /api/mock-drive/:id/my-report                # Get my detailed report

# Leaderboard
GET    /api/mock-drive/:id/leaderboard              # View leaderboard
GET    /api/mock-drive/:id/leaderboard/my-rank      # Get my rank


┌──────────────────────────────────────────────────────────────────────────────┐
│                        STUDENT ATTEMPT FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────┘

                    Student clicks "Start MockDrive"
                              │
                              ▼
                    ┌─────────────────┐
                    │ AttemptService  │
                    │ .startAttempt() │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Create MockDriveAttempt     │
              │  Create ModuleAttempts       │
              │  (All locked except first)   │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Return first module info    │
              │  Module 1: AVAILABLE         │
              └──────────────┬───────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   APTITUDE    │   │    MACHINE    │   │  AI INTERVIEW │
│   Executor    │   │   Executor    │   │   Executor    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │ Uses existing     │ Uses existing     │ Uses existing
        │ AptitudeService   │ MachineService    │ InterviewService
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────────────────────────────────────────────┐
│              Module Completion / Timeout              │
│                                                       │
│  1. Calculate module score                            │
│  2. Save to MockDriveModuleAttempt.moduleData         │
│  3. Mark current module COMPLETED/TIMED_OUT           │
│  4. Unlock next module (set to AVAILABLE)             │
│  5. Return next module info                           │
└───────────────────────────┬───────────────────────────┘
                            │
                            ▼
              ┌──────────────────────────────┐
              │  All modules completed?       │
              │                              │
              │  YES → Calculate final score │
              │        Generate report       │
              │        Update leaderboard    │
              │                              │
              │  NO  → Continue to next      │
              └──────────────────────────────┘



              D:\PREPLYTE\FRONTEND\SRC
│
├───app
│   │
│   ├───institute-admin
│   │   │   layout.tsx
│   │   │   page.tsx
│   │   │
│   │   └───mock-drives
│   │       │   page.tsx
│   │       │
│   │       ├───new
│   │       │       page.tsx
│   │       │
│   │       └───[driveId]
│   │           │   page.tsx
│   │           │
│   │           ├───analytics
│   │           │       page.tsx
│   │           │
│   │           ├───batches
│   │           │   │   page.tsx
│   │           │   │
│   │           │   ├───auto-create
│   │           │   │       page.tsx
│   │           │   │
│   │           │   ├───new
│   │           │   │       page.tsx
│   │           │   │
│   │           │   └───[batchId]
│   │           │       │   page.tsx
│   │           │       │
│   │           │       └───assign
│   │           │               page.tsx
│   │           │
│   │           ├───edit
│   │           │       page.tsx
│   │           │
│   │           ├───eligibility
│   │           │       page.tsx
│   │           │
│   │           ├───leaderboard
│   │           │       page.tsx
│   │           │
│   │           ├───modules
│   │           │   │   page.tsx
│   │           │   │
│   │           │   ├───new
│   │           │   │       page.tsx
│   │           │   │
│   │           │   └───[moduleId]
│   │           │           page.tsx
│   │           │
│   │           ├───registrations
│   │           │       page.tsx
│   │           │
│   │           └───results
│   │               │   page.tsx
│   │               │
│   │               └───[attemptId]
│   │                       page.tsx
│   │
│   └───mock-drive
│       │   page.tsx
│       │
│       ├───my-registrations
│       │       page.tsx
│       │
│       └───[driveId]
│           │   page.tsx
│           │
│           ├───attempt
│           │   │   page.tsx
│           │   │
│           │   └───[moduleId]
│           │           page.tsx
│           │
│           ├───leaderboard
│           │       page.tsx
│           │
│           └───result
│                   page.tsx
│
├───components
│   │
│   ├───institute-admin
│   │   │   institute-admin-header.tsx
│   │   │   institute-admin-sidebar.tsx
│   │   │
│   │   └───mock-drive
│   │       │   drive-card.tsx
│   │       │   drive-list.tsx
│   │       │   drive-stats-cards.tsx
│   │       │   drive-status-badge.tsx
│   │       │
│   │       ├───analytics
│   │       │       analytics-overview.tsx
│   │       │       batch-comparison.tsx
│   │       │       completion-chart.tsx
│   │       │       module-performance.tsx
│   │       │       score-distribution.tsx
│   │       │       time-analysis.tsx
│   │       │
│   │       ├───batches
│   │       │       auto-batch-wizard.tsx
│   │       │       batch-card.tsx
│   │       │       batch-form.tsx
│   │       │       batch-list.tsx
│   │       │       batch-scheduler.tsx
│   │       │       batch-timeline.tsx
│   │       │       student-assignment.tsx
│   │       │
│   │       ├───create-wizard
│   │       │       step-basic-info.tsx
│   │       │       step-eligibility.tsx
│   │       │       step-modules.tsx
│   │       │       step-review.tsx
│   │       │       step-schedule.tsx
│   │       │       wizard-container.tsx
│   │       │       wizard-navigation.tsx
│   │       │       wizard-progress.tsx
│   │       │
│   │       ├───eligibility
│   │       │       criteria-builder.tsx
│   │       │       eligibility-form.tsx
│   │       │       eligibility-preview.tsx
│   │       │
│   │       ├───leaderboard
│   │       │       leaderboard-filters.tsx
│   │       │       leaderboard-table.tsx
│   │       │       rank-badge.tsx
│   │       │       top-performers.tsx
│   │       │
│   │       ├───modules
│   │       │       aptitude-config.tsx
│   │       │       interview-config.tsx
│   │       │       machine-config.tsx
│   │       │       module-card.tsx
│   │       │       module-form.tsx
│   │       │       module-list.tsx
│   │       │       module-reorder.tsx
│   │       │
│   │       ├───registrations
│   │       │       bulk-actions.tsx
│   │       │       eligibility-check-view.tsx
│   │       │       registration-actions.tsx
│   │       │       registration-card.tsx
│   │       │       registration-list.tsx
│   │       │
│   │       └───results
│   │               module-score-breakdown.tsx
│   │               results-export.tsx
│   │               results-filters.tsx
│   │               results-table.tsx
│   │               student-result-detail.tsx
│   │
│   └───mock-drive
│       │
│       ├───attempt
│       │   │   attempt-complete.tsx
│       │   │   attempt-container.tsx
│       │   │   attempt-header.tsx
│       │   │   auto-submit-warning.tsx
│       │   │   countdown-timer.tsx
│       │   │   module-progress.tsx
│       │   │   module-transition.tsx
│       │   │
│       │   ├───modules
│       │   │       aptitude-module.tsx
│       │   │       interview-module.tsx
│       │   │       machine-module.tsx
│       │   │       module-complete.tsx
│       │   │       module-instructions.tsx
│       │   │
│       │   └───proctoring
│       │           activity-monitor.tsx
│       │           fullscreen-prompt.tsx
│       │           tab-switch-warning.tsx
│       │
│       ├───discovery
│       │       batch-info-card.tsx
│       │       drive-card.tsx
│       │       drive-filters.tsx
│       │       drive-list.tsx
│       │       eligibility-status.tsx
│       │       my-registrations-list.tsx
│       │       registration-button.tsx
│       │
│       ├───leaderboard
│       │       leaderboard-entry.tsx
│       │       leaderboard-view.tsx
│       │       my-rank-card.tsx
│       │       rank-comparison.tsx
│       │
│       └───results
│               download-report.tsx
│               feedback-section.tsx
│               module-result-card.tsx
│               performance-chart.tsx
│               recommendations.tsx
│               result-card.tsx
│               result-overview.tsx
│               score-breakdown.tsx
│               strengths-weaknesses.tsx
│
├───lib
│   │
│   ├───api
│   │   │   endpoints.ts
│   │   │
│   │   └───services
│   │       │
│   │       ├───institute-admin
│   │       │       analytics.service.ts
│   │       │       batch.service.ts
│   │       │       eligibility.service.ts
│   │       │       mockdrive.service.ts
│   │       │       modules.service.ts
│   │       │       registration.service.ts
│   │       │       results.service.ts
│   │       │
│   │       └───mock-drive
│   │               attempt.service.ts
│   │               discovery.service.ts
│   │               leaderboard.service.ts
│   │               results.service.ts
│   │
│   ├───constants
│   │       mockdrive.constants.ts
│   │
│   ├───hooks
│   │   │
│   │   ├───institute-admin
│   │   │       use-batches.ts
│   │   │       use-drive-analytics.ts
│   │   │       use-drive-results.ts
│   │   │       use-eligibility.ts
│   │   │       use-mockdrive.ts
│   │   │       use-modules.ts
│   │   │       use-registrations.ts
│   │   │
│   │   └───mock-drive
│   │           use-attempt-result.ts
│   │           use-attempt.ts
│   │           use-discovery.ts
│   │           use-leaderboard.ts
│   │           use-module-timer.ts
│   │           use-registration.ts
│   │
│   ├───store
│   │   │
│   │   ├───institute-admin
│   │   │       batch-store.ts
│   │   │       mockdrive-store.ts
│   │   │
│   │   └───mock-drive
│   │           attempt-store.ts
│   │           discovery-store.ts
│   │
│   └───validations
│           mockdrive.schema.ts
│
└───types
        institute-admin.types.ts
        mockdrive.types.ts

        Page Responsibilities
Institute Admin Pages
Page	Responsibility
/institute-admin	Dashboard with overview stats
/institute-admin/mock-drives	List all mock drives with filters
/institute-admin/mock-drives/new	Multi-step wizard to create mock drive
/institute-admin/mock-drives/[driveId]	Mock drive overview & quick actions
/institute-admin/mock-drives/[driveId]/edit	Edit basic settings
/institute-admin/mock-drives/[driveId]/eligibility	Configure eligibility criteria
/institute-admin/mock-drives/[driveId]/modules	Add/edit/reorder modules
/institute-admin/mock-drives/[driveId]/registrations	Manage student registrations
/institute-admin/mock-drives/[driveId]/batches	Create & manage batches
/institute-admin/mock-drives/[driveId]/batches/auto-create	Auto-generate batches
/institute-admin/mock-drives/[driveId]/results	View all results
/institute-admin/mock-drives/[driveId]/analytics	Charts & insights
/institute-admin/mock-drives/[driveId]/leaderboard	Full leaderboard
Student Pages
Page	Responsibility
/mock-drive	Browse available mock drives
/mock-drive/my-registrations	View my registered drives & batch info
/mock-drive/[driveId]	Drive details, eligibility check, register
/mock-drive/[driveId]/attempt	Main attempt flow (sequential modules)
/mock-drive/[driveId]/attempt/[moduleId]	Execute specific module
/mock-drive/[driveId]/result	View my detailed result & report
/mock-drive/[driveId]/leaderboard	View rankings



┌────────────────────────────────────────────────────────────────────────────────┐
│                     STUDENT ATTEMPT UI FLOW                                     │
└────────────────────────────────────────────────────────────────────────────────┘

/mock-drive/[driveId]/attempt
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  AttemptContainer                                               │
│  ├── AttemptHeader (drive info, overall progress)              │
│  ├── ModuleProgress (visual progress of all modules)           │
│  │                                                              │
│  └── Current Module Content:                                   │
│      │                                                          │
│      ├── LOCKED → "Module will unlock after previous"          │
│      │                                                          │
│      ├── AVAILABLE → ModuleInstructions                        │
│      │               └── "Start Module" button                 │
│      │                                                          │
│      ├── IN_PROGRESS → Based on moduleType:                    │
│      │   │                                                      │
│      │   ├── APTITUDE → AptitudeModule                         │
│      │   │   └── (Reuses practice/aptitude components)         │
│      │   │                                                      │
│      │   ├── MACHINE_CODING → MachineModule                    │
│      │   │   └── (Reuses practice/machine components)          │
│      │   │                                                      │
│      │   └── AI_INTERVIEW → InterviewModule                    │
│      │       └── (Reuses practice/ai-interview components)     │
│      │                                                          │
│      ├── COMPLETED → ModuleComplete                            │
│      │               └── "Continue to Next" button             │
│      │                                                          │
│      └── All COMPLETED → AttemptComplete                       │
│                          └── "View Results" button             │
│                                                                 │
│  Overlays:                                                      │
│  ├── CountdownTimer (per module)                               │
│  ├── AutoSubmitWarning (5 min before timeout)                  │
│  └── TabSwitchWarning (proctoring)                             │
└─────────────────────────────────────────────────────────────────┘




















├───app
│   │
│   ├───institute-admin
│   │   │   layout.tsx
│   │   │   page.tsx
│   │   │
│   │   └───mock-drives
│   │       │   page.tsx
│   │       │
│   │       ├───new
│   │       │       page.tsx
│   │       │
│   │       └───[driveId]
│   │           │   page.tsx
│   │           │
│   │           ├───analytics
│   │           │       page.tsx
│   │           │
│   │           ├───batches
│   │           │   │   page.tsx
│   │           │   │
│   │           │   ├───auto-create
│   │           │   │       page.tsx
│   │           │   │
│   │           │   ├───new
│   │           │   │       page.tsx
│   │           │   │
│   │           │   └───[batchId]
│   │           │       │   page.tsx
│   │           │       │
│   │           │       └───assign
│   │           │               page.tsx
│   │           │
│   │           ├───edit
│   │           │       page.tsx
│   │           │
│   │           ├───eligibility
│   │           │       page.tsx
│   │           │
│   │           ├───leaderboard
│   │           │       page.tsx
│   │           │
│   │           ├───modules
│   │           │   │   page.tsx
│   │           │   │
│   │           │   ├───new
│   │           │   │       page.tsx
│   │           │   │
│   │           │   └───[moduleId]
│   │           │           page.tsx
│   │           │
│   │           ├───registrations
│   │           │       page.tsx
│   │           │
│   │           └───results
│   │               │   page.tsx
│   │               │
│   │               └───[attemptId]
│   │                       page.tsx
├───components
│   │
│   ├───institute-admin
│   │   │   institute-admin-header.tsx
│   │   │   institute-admin-sidebar.tsx
│   │   │
│   │   └───mock-drive
│   │       │   drive-card.tsx
│   │       │   drive-list.tsx
│   │       │   drive-stats-cards.tsx
│   │       │   drive-status-badge.tsx
│   │       │
│   │       ├───analytics
│   │       │       analytics-overview.tsx
│   │       │       batch-comparison.tsx
│   │       │       completion-chart.tsx
│   │       │       module-performance.tsx
│   │       │       score-distribution.tsx
│   │       │       time-analysis.tsx
│   │       │
│   │       ├───batches
│   │       │       auto-batch-wizard.tsx
│   │       │       batch-card.tsx
│   │       │       batch-form.tsx
│   │       │       batch-list.tsx
│   │       │       batch-scheduler.tsx
│   │       │       batch-timeline.tsx
│   │       │       student-assignment.tsx
│   │       │
│   │       ├───create-wizard
│   │       │       step-basic-info.tsx
│   │       │       step-eligibility.tsx
│   │       │       step-modules.tsx
│   │       │       step-review.tsx
│   │       │       step-schedule.tsx
│   │       │       wizard-container.tsx
│   │       │       wizard-navigation.tsx
│   │       │       wizard-progress.tsx
│   │       │
│   │       ├───eligibility
│   │       │       criteria-builder.tsx
│   │       │       eligibility-form.tsx
│   │       │       eligibility-preview.tsx
│   │       │
│   │       ├───leaderboard
│   │       │       leaderboard-filters.tsx
│   │       │       leaderboard-table.tsx
│   │       │       rank-badge.tsx
│   │       │       top-performers.tsx
│   │       │
│   │       ├───modules
│   │       │       aptitude-config.tsx
│   │       │       interview-config.tsx
│   │       │       machine-config.tsx
│   │       │       module-card.tsx
│   │       │       module-form.tsx
│   │       │       module-list.tsx
│   │       │       module-reorder.tsx
│   │       │
│   │       ├───registrations
│   │       │       bulk-actions.tsx
│   │       │       eligibility-check-view.tsx
│   │       │       registration-actions.tsx
│   │       │       registration-card.tsx
│   │       │       registration-list.tsx
│   │       │
│   │       └───results
│   │               module-score-breakdown.tsx
│   │               results-export.tsx
│   │               results-filters.tsx
│   │               results-table.tsx
│   │               student-result-detail.tsx
│
├───lib
│   │
│   ├───api
│   │   │   endpoints.ts
│   │   │
│   │   └───services
│   │       │
│   │       ├───institute-admin
│   │       │       analytics.service.ts
│   │       │       batch.service.ts
│   │       │       eligibility.service.ts
│   │       │       mockdrive.service.ts
│   │       │       modules.service.ts
│   │       │       registration.service.ts
│   │       │       results.service.ts
│   │
│   ├───constants
│   │       mockdrive.constants.ts
│   │
│   ├───hooks
│   │   │
│   │   ├───institute-admin
│   │   │       use-batches.ts
│   │   │       use-drive-analytics.ts
│   │   │       use-drive-results.ts
│   │   │       use-eligibility.ts
│   │   │       use-mockdrive.ts
│   │   │       use-modules.ts
│   │   │       use-registrations.ts
│   │
│   ├───store
│   │   │
│   │   ├───institute-admin
│   │   │       batch-store.ts
│   │   │       mockdrive-store.ts
│   │ 
│   │
│   └───validations
│           mockdrive.schema.ts
│
└───types
        institute-admin.types.ts
