import { AiInterviewDifficulty, AiInterviewQuestionCategory } from '@prisma/client';
import { ParsedResume, ConversationContext, QuestionState, ResponseScores } from '../interview.types';
interface QuestionGenerationResult {
    question: string;
    category: AiInterviewQuestionCategory;
    isFollowUp: boolean;
    metadata?: {
        expectedTopics?: string[];
        followUpPotential?: string[];
    };
}
interface ScoringResult {
    scores: ResponseScores;
    feedback: string;
    strengths: string[];
    improvements: string[];
    shouldFollowUp: boolean;
    followUpReason?: string;
}
declare class ConversationEngineService {
    private groq;
    constructor();
    /**
     * Initialize a new conversation context
     */
    initializeContext(resume: ParsedResume, config: {
        jobTitle: string;
        companyName: string | null;
        difficulty: AiInterviewDifficulty;
        focusAreas: string[];
        targetQuestions: number;
    }): Promise<ConversationContext>;
    /**
     * Generate the opening message/question
     */
    generateOpening(context: ConversationContext): Promise<QuestionGenerationResult>;
    /**
     * Generate the next question based on conversation context
     */
    generateNextQuestion(context: ConversationContext, candidateResponse?: string): Promise<QuestionGenerationResult>;
    /**
     * Score a candidate's response
     */
    scoreResponse(question: string, answer: string, category: AiInterviewQuestionCategory, context: ConversationContext): Promise<ScoringResult>;
    /**
     * Generate transition to new topic
     */
    generateTopicTransition(context: ConversationContext, nextCategory: AiInterviewQuestionCategory): Promise<string>;
    /**
     * Check if interview should end
     */
    shouldEndInterview(context: ConversationContext): boolean;
    /**
     * Get current question state
     */
    getCurrentQuestionState(context: ConversationContext): QuestionState | null;
    private shouldAskFollowUp;
    private determineNextCategory;
    private shouldCloseInterview;
    private hasCompletedAllCategories;
    private generateClosingQuestion;
    private getExpectedTopics;
    private validateScores;
}
export declare const conversationEngineService: ConversationEngineService;
export { ConversationEngineService };
//# sourceMappingURL=conversation-engine.service.d.ts.map