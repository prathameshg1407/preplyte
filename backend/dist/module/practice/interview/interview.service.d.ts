import { AiInterviewSessionStatus } from '@prisma/client';
import { CreateSessionInput, InterviewSessionResponse, SessionListResponse, SessionDetailResponse, InterviewFeedback } from './interview.types';
declare class InterviewService {
    /**
     * Create a new interview session
     */
    createSession(userId: string, input: CreateSessionInput): Promise<InterviewSessionResponse>;
    /**
     * Start an interview session
     * NOTE: This only updates the session status. Opening generation is handled by WebSocket gateway.
     */
    startSession(userId: string, sessionId: string): Promise<{
        session: InterviewSessionResponse;
        openingMessage: string | null;
    }>;
    /**
     * Get session by ID
     */
    getSession(userId: string, sessionId: string): Promise<InterviewSessionResponse>;
    /**
     * Get session details with responses and feedback
     */
    getSessionDetail(userId: string, sessionId: string): Promise<SessionDetailResponse>;
    /**
     * List user's sessions
     */
    listSessions(userId: string, options: {
        page?: number;
        pageSize?: number;
        status?: AiInterviewSessionStatus;
    }): Promise<SessionListResponse>;
    /**
     * Cancel an active session
     */
    cancelSession(userId: string, sessionId: string): Promise<void>;
    /**
     * End session and generate feedback
     */
    endSession(userId: string, sessionId: string): Promise<InterviewFeedback>;
    /**
     * Submit a response to the current question
     */
    submitResponse(userId: string, sessionId: string, answer: string, timeTakenSeconds?: number): Promise<{
        nextQuestion: string | null;
        isComplete: boolean;
        scores: any;
    }>;
    /**
     * Get feedback for a session
     */
    getFeedback(userId: string, sessionId: string): Promise<InterviewFeedback>;
    private getSessionOrThrow;
    private rebuildContext;
    private createMinimalResume;
    private calculateSessionMetrics;
}
export declare const interviewService: InterviewService;
export { InterviewService };
//# sourceMappingURL=interview.service.d.ts.map