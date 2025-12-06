import { AiInterviewSession, AiInterviewResponse, AiInterviewFeedback, AiInterviewSessionStatus, AiInterviewQuestionCategory, AiInterviewDifficulty, Resume } from '@prisma/client';
export interface CreateSessionInput {
    resumeId?: string;
    jobTitle?: string;
    companyName?: string;
    difficulty?: AiInterviewDifficulty;
    focusAreas?: string[];
    targetQuestions?: number;
}
export interface SessionConfig {
    resumeId: string | null;
    jobTitle: string;
    companyName: string | null;
    difficulty: AiInterviewDifficulty;
    focusAreas: string[];
    targetQuestions: number;
}
export interface InterviewSessionResponse {
    id: string;
    userId: string;
    status: AiInterviewSessionStatus;
    config: SessionConfig;
    progress: SessionProgress;
    wsUrl: string;
    createdAt: Date;
    startedAt: Date | null;
}
export interface SessionProgress {
    totalQuestions: number;
    currentQuestionIndex: number;
    questionsAnswered: number;
    estimatedTimeRemaining: number;
    percentComplete: number;
}
export interface SessionState {
    sessionId: string;
    status: AiInterviewSessionStatus;
    currentQuestion: QuestionState | null;
    isListening: boolean;
    isAISpeaking: boolean;
    progress: SessionProgress;
}
export interface GeneratedQuestion {
    id: string;
    category: AiInterviewQuestionCategory;
    question: string;
    context?: string;
    expectedTopics?: string[];
    followUpPotential: string[];
    order: number;
}
export interface QuestionState {
    id: string;
    category: AiInterviewQuestionCategory;
    question: string;
    order: number;
    isFollowUp: boolean;
    parentQuestionId?: string;
    startedAt: Date;
}
export interface QuestionResponse {
    questionId: string;
    category: AiInterviewQuestionCategory;
    question: string;
    answer: string;
    isFollowUp: boolean;
    timeTakenSeconds: number;
    scores: ResponseScores;
    feedback: string;
}
export interface ResponseScores {
    relevance: number;
    clarity: number;
    depth: number;
    technicalAccuracy: number | null;
    communication: number;
    overall: number;
}
export interface ConversationMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    audioUrl?: string;
    metadata?: MessageMetadata;
}
export interface MessageMetadata {
    questionId?: string;
    category?: AiInterviewQuestionCategory;
    isFollowUp?: boolean;
    scores?: ResponseScores;
    transcriptionConfidence?: number;
}
export interface ConversationContext {
    resume: ParsedResume;
    config: SessionConfig;
    history: ConversationMessage[];
    questionsAsked: GeneratedQuestion[];
    currentTopic: string | null;
    followUpDepth: number;
    candidateProfile: CandidateProfile;
}
export interface ParsedResume {
    rawText: string;
    structured: StructuredResume;
    hash: string;
    parsedAt: Date;
}
export interface StructuredResume {
    name: string;
    email: string;
    phone: string;
    summary?: string;
    skills: string[];
    experience: WorkExperience[];
    education: Education[];
    projects: Project[];
    certifications?: string[];
    achievements?: string[];
}
export interface WorkExperience {
    company: string;
    role: string;
    duration: string;
    startDate?: string;
    endDate?: string;
    responsibilities: string[];
    technologies?: string[];
}
export interface Education {
    institution: string;
    degree: string;
    field?: string;
    year: string;
    gpa?: string;
}
export interface Project {
    name: string;
    description: string;
    technologies: string[];
    highlights?: string[];
    url?: string;
}
export interface CandidateProfile {
    name: string;
    yearsOfExperience: number;
    primarySkills: string[];
    recentRole: string;
    industryBackground: string[];
}
export interface InterviewFeedback {
    id: string;
    sessionId: string;
    overallScore: number;
    overallSummary: string;
    categoryScores: CategoryScores;
    keyStrengths: string[];
    areasForImprovement: string[];
    questionFeedback: QuestionFeedbackItem[];
    recommendations: string[];
    hiringRecommendation: HiringRecommendation;
    detailedAnalysis: DetailedAnalysis;
    generatedAt: Date;
}
export interface CategoryScores {
    technical: CategoryScore;
    behavioral: CategoryScore;
    communication: CategoryScore;
    problemSolving: CategoryScore;
    cultureFit: CategoryScore;
}
export interface CategoryScore {
    score: number;
    maxScore: number;
    feedback: string;
}
export interface QuestionFeedbackItem {
    questionId: string;
    question: string;
    category: AiInterviewQuestionCategory;
    answer: string;
    scores: ResponseScores;
    feedback: string;
    suggestions: string[];
}
export type HiringRecommendation = 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
export interface DetailedAnalysis {
    technicalDepth: string;
    communicationStyle: string;
    problemSolvingApproach: string;
    leadershipPotential: string;
    growthMindset: string;
}
export interface TranscriptionResult {
    text: string;
    isFinal: boolean;
    confidence: number;
    words?: TranscribedWord[];
}
export interface TranscribedWord {
    word: string;
    start: number;
    end: number;
    confidence: number;
}
export interface TTSResult {
    audioBuffer: Buffer;
    format: string;
    duration: number;
}
export interface TTSRequest {
    text: string;
    voice?: string;
    speed?: number;
}
export interface WSClientMessage {
    type: string;
    data?: unknown;
    timestamp?: number;
}
export interface WSServerMessage {
    type: string;
    data?: unknown;
    timestamp: number;
    sessionId?: string;
}
export interface WSTranscriptionMessage extends WSServerMessage {
    type: 'transcription' | 'transcription_final';
    data: {
        text: string;
        isFinal: boolean;
        confidence?: number;
    };
}
export interface WSAudioMessage extends WSServerMessage {
    type: 'ai_audio';
    data: {
        chunk: string;
        isLast: boolean;
        format: string;
    };
}
export interface WSErrorMessage extends WSServerMessage {
    type: 'error';
    data: {
        code: string;
        message: string;
        recoverable: boolean;
    };
}
export interface ActiveSession {
    id: string;
    userId: string;
    wsConnectionId: string;
    status: AiInterviewSessionStatus;
    startedAt: Date;
    lastActivityAt: Date;
    conversationEngine: ConversationContext;
}
export interface SessionMetrics {
    totalDuration: number;
    questionsAsked: number;
    questionsAnswered: number;
    averageResponseTime: number;
    longestResponse: number;
    shortestResponse: number;
    silencePeriods: number;
}
export interface SessionListResponse {
    sessions: InterviewSessionSummary[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface InterviewSessionSummary {
    id: string;
    status: AiInterviewSessionStatus;
    jobTitle: string;
    difficulty: AiInterviewDifficulty;
    questionsAnswered: number;
    totalQuestions: number;
    overallScore: number | null;
    createdAt: Date;
    completedAt: Date | null;
}
export interface SessionDetailResponse {
    session: InterviewSessionResponse;
    responses: QuestionResponse[];
    feedback: InterviewFeedback | null;
    metrics: SessionMetrics | null;
}
export declare function mapSessionToResponse(session: AiInterviewSession & {
    resume?: Resume | null;
}): InterviewSessionResponse;
export declare function mapFeedbackToResponse(feedback: AiInterviewFeedback, responses: AiInterviewResponse[]): InterviewFeedback;
export declare function mapResponseToQuestionResponse(response: AiInterviewResponse): QuestionResponse;
export declare function mapSessionToSummary(session: AiInterviewSession & {
    feedback?: AiInterviewFeedback | null;
}): InterviewSessionSummary;
//# sourceMappingURL=interview.types.d.ts.map