import { MockDriveStatus, MockDriveModuleType, MockDriveAttemptStatus, MockDriveModuleAttemptStatus, MockDriveRegistrationStatus, DifficultyLevel, QuestionType, AiInterviewDifficulty, AiInterviewQuestionCategory, SubmissionStatus } from '@prisma/client';
export interface AptitudeModuleConfig {
    difficulty: DifficultyLevel;
    questionTypes: QuestionType[];
    numberOfQuestions: number;
    marksPerQuestion: number;
    negativeMarking: number;
    passingPercentage?: number;
}
export interface MachineModuleConfig {
    difficulty: DifficultyLevel;
    numberOfQuestions: number;
    allowedLanguages: string[];
    partialScoring: boolean;
    maxScorePerQuestion: number;
    passingScore?: number;
}
export interface AiInterviewModuleConfig {
    difficulty: AiInterviewDifficulty;
    jobTitle: string;
    companyName?: string;
    focusAreas: string[];
    targetQuestions: number;
}
export type ModuleConfig = AptitudeModuleConfig | MachineModuleConfig | AiInterviewModuleConfig;
export interface AptitudeQuestionAttempt {
    questionId: string;
    aptitudeQuestionId: string;
    displayOrder: number;
    selectedOptionId: string | null;
    isCorrect: boolean | null;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
    answeredAt: string | null;
}
export interface AptitudeModuleSummary {
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
    marksObtained: number;
    negativeMarks: number;
    finalScore: number;
    maxScore: number;
}
export interface AptitudeModuleData {
    questions: AptitudeQuestionAttempt[];
    summary?: AptitudeModuleSummary;
}
export interface MachineSubmissionData {
    id: string;
    code: string;
    languageId: number;
    languageName: string;
    status: SubmissionStatus;
    testCasesPassed: number;
    testCasesTotal: number;
    executionTime: number | null;
    memoryUsed: number | null;
    stdout: string | null;
    stderr: string | null;
    compileError: string | null;
    submittedAt: string;
}
export interface MachineQuestionAttempt {
    questionId: string;
    machineQuestionId: string;
    displayOrder: number;
    submissions: MachineSubmissionData[];
    bestSubmissionId: string | null;
    bestScore: number;
    isSolved: boolean;
}
export interface MachineModuleSummary {
    totalQuestions: number;
    totalSolved: number;
    totalPartial: number;
    totalUnattempted: number;
    totalScore: number;
    maxScore: number;
}
export interface MachineModuleData {
    questions: MachineQuestionAttempt[];
    summary?: MachineModuleSummary;
    _runResult?: {
        stdout: string | null;
        stderr: string | null;
        executionTime: number | null;
    };
}
export interface AiInterviewConfig {
    resumeId: string;
    resumeUrl: string;
    jobTitle: string;
    companyName: string | null;
    difficulty: AiInterviewDifficulty;
    focusAreas: string[];
    targetQuestions: number;
}
export interface ConversationMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: string;
}
export interface ResponseScores {
    relevance: number;
    clarity: number;
    depth: number;
    technicalAccuracy: number | null;
    overall: number;
}
export interface InterviewResponseData {
    id: string;
    questionIndex: number;
    category: AiInterviewQuestionCategory;
    question: string;
    answer: string;
    isFollowup: boolean;
    scores: ResponseScores;
    feedback: string;
    timeTakenSeconds: number;
    answeredAt: string;
}
export interface CategoryScore {
    score: number;
    count: number;
}
export interface InterviewModuleSummary {
    totalQuestions: number;
    questionsAnswered: number;
    overallScore: number;
    maxScore: number;
    categoryScores: Record<AiInterviewQuestionCategory, CategoryScore>;
    keyStrengths: string[];
    areasForImprovement: string[];
    overallFeedback: string;
}
export interface AiInterviewModuleData {
    config: AiInterviewConfig;
    conversation: ConversationMessage[];
    responses: InterviewResponseData[];
    summary?: InterviewModuleSummary;
    isVoiceEnabled?: boolean;
    pendingTranscription?: string;
}
export type ModuleData = AptitudeModuleData | MachineModuleData | AiInterviewModuleData;
export interface ModuleAttemptState {
    moduleId: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string | null;
    status: MockDriveModuleAttemptStatus;
    timeLimit: number;
    startedAt: Date | null;
    expiresAt: Date | null;
    timeSpentSeconds: number;
}
export interface AttemptState {
    attemptId: string;
    status: MockDriveAttemptStatus;
    currentModuleOrder: number;
    startedAt: Date | null;
    modules: ModuleAttemptState[];
}
export interface CurrentModuleState {
    moduleAttemptId: string;
    moduleId: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string | null;
    status: MockDriveModuleAttemptStatus;
    timeLimit: number;
    instructions: string | null;
    startedAt: Date | null;
    expiresAt: Date | null;
    timeRemainingSeconds: number;
    config: ModuleConfig;
    data: ModuleData | null;
}
export interface EligibilityCheck {
    criterion: string;
    passed: boolean;
    details: string;
    value?: string | number;
    required?: string | number;
}
export interface EligibilityCheckResult {
    isEligible: boolean;
    checks: EligibilityCheck[];
    failedCriteria: string[];
}
export interface ModuleScore {
    moduleId: string;
    moduleType: MockDriveModuleType;
    moduleName: string;
    score: number;
    maxScore: number;
    percentage: number;
}
export interface MockDriveListItem {
    id: string;
    title: string;
    description: string | null;
    status: MockDriveStatus;
    registrationStartDate: Date | null;
    registrationEndDate: Date | null;
    driveStartDate: Date | null;
    driveEndDate: Date | null;
    moduleCount: number;
    registrationCount: number;
    institute: {
        id: string;
        name: string;
    };
    isRegistered: boolean;
    registrationStatus: MockDriveRegistrationStatus | null;
    batchInfo: {
        id: string;
        name: string;
        scheduledStartTime: Date;
        scheduledEndTime: Date;
    } | null;
}
export interface MockDriveDetail extends Omit<MockDriveListItem, 'moduleCount'> {
    instructions: string | null;
    modules: {
        id: string;
        moduleType: MockDriveModuleType;
        order: number;
        name: string | null;
        timeLimit: number;
        weightage: number;
        instructions: string | null;
    }[];
    eligibilityCriteria: {
        minCgpa: number | null;
        maxCgpa: number | null;
        minMarks10: number | null;
        minMarks12: number | null;
        allowedDepartments: string[];
        allowedCourseYears: string[];
        requiredSkills: string[];
        maxBacklogs: number | null;
    } | null;
    totalTimeLimit: number;
}
//# sourceMappingURL=mockdrive.shared-types.d.ts.map