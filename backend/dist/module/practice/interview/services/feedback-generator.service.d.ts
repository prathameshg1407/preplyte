import { InterviewFeedback } from '../interview.types';
declare class FeedbackGeneratorService {
    private groq;
    constructor();
    /**
     * Generate comprehensive feedback for a completed session
     */
    generateFeedback(sessionId: string): Promise<InterviewFeedback>;
    /**
     * Get existing feedback for a session
     */
    getFeedback(sessionId: string): Promise<InterviewFeedback | null>;
    /**
     * Regenerate feedback for a session
     */
    regenerateFeedback(sessionId: string): Promise<InterviewFeedback>;
    private generateAIFeedback;
    private validateAndMapFeedback;
    private calculateFallbackFeedback;
    private calculateAverageScores;
    private calculateWeightedOverall;
    private buildCategoryScoresFromResponses;
    private buildQuestionFeedback;
    private generateQuestionFeedback;
    private clampScore;
    private validateCategoryScores;
    private validateHiringRecommendation;
    private validateDetailedAnalysis;
    private scoreToRecommendation;
    private generateSummaryFromScore;
    private identifyStrengths;
    private identifyImprovements;
    private generateRecommendations;
    private getDefaultScores;
    private getMinimalResume;
    private mapDbFeedbackToResponse;
}
export declare const feedbackGeneratorService: FeedbackGeneratorService;
export { FeedbackGeneratorService };
//# sourceMappingURL=feedback-generator.service.d.ts.map