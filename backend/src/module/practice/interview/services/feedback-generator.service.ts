// src/module/practice/interview/services/feedback-generator.service.ts

import { AiInterviewQuestionCategory, AiInterviewDifficulty, Prisma } from '@prisma/client';
import { GroqApiManager } from '../../../../utils/groq-manager';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import { InternalError, NotFoundError } from '../../../../utils/errors';
import {
  InterviewFeedback,
  CategoryScores,
  QuestionFeedbackItem,
  ResponseScores,
  HiringRecommendation,
  DetailedAnalysis,
  StructuredResume,
} from '../interview.types';
import { buildFeedbackPrompt } from '../interview.prompts';
import { AI_CONFIG, SCORING_CONFIG } from '../interview.constants';

// =====================================================
// TYPES
// =====================================================

interface ResponseData {
  question: string;
  answer: string;
  category: AiInterviewQuestionCategory;
  scores: ResponseScores;
}

// =====================================================
// SERVICE CLASS
// =====================================================

class FeedbackGeneratorService {
  private groq: GroqApiManager;

  constructor() {
    this.groq = new GroqApiManager();
  }

  // ===================================================
  // PUBLIC METHODS
  // ===================================================

  /**
   * Generate comprehensive feedback for a completed session
   */
  async generateFeedback(sessionId: string): Promise<InterviewFeedback> {
    logger.info('[FeedbackGenerator] Generating feedback', { sessionId });

    // Fetch session with all related data
    const session = await prisma.aiInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        resume: true,
        responses: {
          orderBy: { questionOrder: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Interview session');
    }

    if (session.responses.length === 0) {
      throw new InternalError('No responses to analyze');
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.aiInterviewFeedback.findUnique({
      where: { sessionId },
    });

    if (existingFeedback) {
      logger.debug('[FeedbackGenerator] Returning existing feedback', { sessionId });
      return this.mapDbFeedbackToResponse(existingFeedback, session.responses);
    }

    // Parse resume for context
    let resumeData: StructuredResume | null = null;
    if (session.resume?.parsedTextHash) {
      // In production, you'd fetch the cached parsed resume
      resumeData = {
        name: 'Candidate',
        email: '',
        phone: '',
        skills: session.focusAreas || [],
        experience: [],
        education: [],
        projects: [],
      };
    }

    // Prepare response data for analysis
    const responses: ResponseData[] = session.responses.map((r) => ({
      question: r.question,
      answer: r.answer,
      category: r.category,
      scores: (r.scoresJson as unknown as ResponseScores) || this.getDefaultScores(),
    }));

    // Generate AI feedback
    const generatedFeedback = await this.generateAIFeedback(
      resumeData || this.getMinimalResume(),
      session.jobTitle || 'Software Engineer',
      session.difficulty,
      responses
    );

    // Save feedback to database
    // Save feedback to database
    // Save feedback to database
    const savedFeedback = await prisma.aiInterviewFeedback.create({
      data: {
        sessionId,
        userId: session.userId,
        overallScore: generatedFeedback.overallScore,
        overallSummary: generatedFeedback.overallSummary,
        keyStrengths: generatedFeedback.keyStrengths,
        areasForImprovement: generatedFeedback.areasForImprovement,
        feedbackJson: {
          categoryScores: generatedFeedback.categoryScores,
          recommendations: generatedFeedback.recommendations,
          hiringRecommendation: generatedFeedback.hiringRecommendation,
          detailedAnalysis: generatedFeedback.detailedAnalysis,
        } as unknown as Prisma.InputJsonValue,
        generatedBy: 'ai',
      },
    });

    // Update session status
    await prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    logger.info('[FeedbackGenerator] Feedback generated successfully', {
      sessionId,
      overallScore: generatedFeedback.overallScore,
    });

    return {
      ...generatedFeedback,
      id: savedFeedback.id,
      sessionId: savedFeedback.sessionId,
      generatedAt: savedFeedback.createdAt,
    };
  }

  /**
   * Get existing feedback for a session
   */
  async getFeedback(sessionId: string): Promise<InterviewFeedback | null> {
    const feedback = await prisma.aiInterviewFeedback.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            responses: {
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!feedback) {
      return null;
    }

    return this.mapDbFeedbackToResponse(feedback, feedback.session.responses);
  }

  /**
   * Regenerate feedback for a session
   */
  async regenerateFeedback(sessionId: string): Promise<InterviewFeedback> {
    // Delete existing feedback
    await prisma.aiInterviewFeedback.deleteMany({
      where: { sessionId },
    });

    // Generate new feedback
    return this.generateFeedback(sessionId);
  }

  // ===================================================
  // PRIVATE: AI GENERATION
  // ===================================================

  private async generateAIFeedback(
    resume: StructuredResume,
    jobTitle: string,
    difficulty: AiInterviewDifficulty,
    responses: ResponseData[]
  ): Promise<Omit<InterviewFeedback, 'id' | 'sessionId' | 'generatedAt'>> {
    const prompt = buildFeedbackPrompt(
      resume,
      jobTitle,
      difficulty,
      responses.map((r) => ({
        question: r.question,
        answer: r.answer,
        category: r.category,
        scores: {
          relevance: r.scores.relevance,
          clarity: r.scores.clarity,
          depth: r.scores.depth,
        },
      }))
    );

    try {
      const result = await this.groq.generateJson<any>(prompt, {
        temperature: AI_CONFIG.FEEDBACK_TEMPERATURE,
        maxTokens: AI_CONFIG.FEEDBACK_MAX_TOKENS,
      });

      return this.validateAndMapFeedback(result, responses);
    } catch (error) {
      logger.error('[FeedbackGenerator] AI feedback generation failed', error);

      // Return calculated fallback
      return this.calculateFallbackFeedback(responses, difficulty);
    }
  }

  private validateAndMapFeedback(
    data: any,
    responses: ResponseData[]
  ): Omit<InterviewFeedback, 'id' | 'sessionId' | 'generatedAt'> {
    return {
      overallScore: this.clampScore(data.overallScore),
      overallSummary: data.overallSummary || 'Interview assessment completed.',
      categoryScores: this.validateCategoryScores(data.categoryScores),
      keyStrengths: Array.isArray(data.keyStrengths)
        ? data.keyStrengths.slice(0, 5)
        : [],
      areasForImprovement: Array.isArray(data.areasForImprovement)
        ? data.areasForImprovement.slice(0, 5)
        : [],
      questionFeedback: this.buildQuestionFeedback(responses),
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations.slice(0, 5)
        : [],
      hiringRecommendation: this.validateHiringRecommendation(
        data.hiringRecommendation
      ),
      detailedAnalysis: this.validateDetailedAnalysis(data.detailedAnalysis),
    };
  }

  private calculateFallbackFeedback(
    responses: ResponseData[],
    difficulty: AiInterviewDifficulty
  ): Omit<InterviewFeedback, 'id' | 'sessionId' | 'generatedAt'> {
    // Calculate average scores
    const avgScores = this.calculateAverageScores(responses);
    const overallScore = this.calculateWeightedOverall(avgScores);

    // Determine hiring recommendation based on score
    const hiringRecommendation = this.scoreToRecommendation(overallScore);

    return {
      overallScore,
      overallSummary: this.generateSummaryFromScore(overallScore, difficulty),
      categoryScores: this.buildCategoryScoresFromResponses(responses),
      keyStrengths: this.identifyStrengths(responses),
      areasForImprovement: this.identifyImprovements(responses),
      questionFeedback: this.buildQuestionFeedback(responses),
      recommendations: this.generateRecommendations(avgScores, difficulty),
      hiringRecommendation,
      detailedAnalysis: {
        technicalDepth: 'Analysis based on response patterns.',
        communicationStyle: 'Assessment based on clarity scores.',
        problemSolvingApproach: 'Evaluation based on depth of responses.',
        leadershipPotential: 'Assessment pending detailed review.',
        growthMindset: 'Demonstrated through interview engagement.',
      },
    };
  }

  // ===================================================
  // PRIVATE: SCORE CALCULATIONS
  // ===================================================

  private calculateAverageScores(responses: ResponseData[]): ResponseScores {
    if (responses.length === 0) {
      return this.getDefaultScores();
    }

    const sums = {
      relevance: 0,
      clarity: 0,
      depth: 0,
      technicalAccuracy: 0,
      communication: 0,
      overall: 0,
    };

    let technicalCount = 0;

    for (const r of responses) {
      sums.relevance += r.scores.relevance;
      sums.clarity += r.scores.clarity;
      sums.depth += r.scores.depth;
      sums.communication += r.scores.communication;
      sums.overall += r.scores.overall;

      if (r.scores.technicalAccuracy !== null) {
        sums.technicalAccuracy += r.scores.technicalAccuracy;
        technicalCount++;
      }
    }

    const count = responses.length;

    return {
      relevance: Math.round((sums.relevance / count) * 10) / 10,
      clarity: Math.round((sums.clarity / count) * 10) / 10,
      depth: Math.round((sums.depth / count) * 10) / 10,
      technicalAccuracy:
        technicalCount > 0
          ? Math.round((sums.technicalAccuracy / technicalCount) * 10) / 10
          : null,
      communication: Math.round((sums.communication / count) * 10) / 10,
      overall: Math.round((sums.overall / count) * 10) / 10,
    };
  }

  private calculateWeightedOverall(scores: ResponseScores): number {
    const weights = SCORING_CONFIG.WEIGHTS;
    let weightedSum = 0;
    let totalWeight = 0;

    weightedSum += scores.relevance * weights.relevance;
    totalWeight += weights.relevance;

    weightedSum += scores.clarity * weights.clarity;
    totalWeight += weights.clarity;

    weightedSum += scores.depth * weights.depth;
    totalWeight += weights.depth;

    weightedSum += scores.communication * weights.communication;
    totalWeight += weights.communication;

    if (scores.technicalAccuracy !== null) {
      weightedSum += scores.technicalAccuracy * weights.technicalAccuracy;
      totalWeight += weights.technicalAccuracy;
    }

    return Math.round((weightedSum / totalWeight) * 10) / 10;
  }

  private buildCategoryScoresFromResponses(
    responses: ResponseData[]
  ): CategoryScores {
    const categoryGroups: Record<string, ResponseData[]> = {
      TECHNICAL: [],
      BEHAVIORAL: [],
      SITUATIONAL: [],
      INTRODUCTORY: [],
      CLOSING: [],
    };

    for (const r of responses) {
      if (categoryGroups[r.category]) {
        categoryGroups[r.category].push(r);
      }
    }

    const buildCategoryScore = (items: ResponseData[], name: string) => {
      if (items.length === 0) {
        return { score: 0, maxScore: 10, feedback: `No ${name} questions asked.` };
      }
      const avg = this.calculateAverageScores(items);
      return {
        score: avg.overall,
        maxScore: 10,
        feedback: `Performance based on ${items.length} ${name} question(s).`,
      };
    };

    return {
      technical: buildCategoryScore(categoryGroups.TECHNICAL, 'technical'),
      behavioral: buildCategoryScore(categoryGroups.BEHAVIORAL, 'behavioral'),
      communication: {
        score: this.calculateAverageScores(responses).communication,
        maxScore: 10,
        feedback: 'Overall communication assessment.',
      },
      problemSolving: buildCategoryScore(categoryGroups.SITUATIONAL, 'problem-solving'),
      cultureFit: {
        score: this.calculateAverageScores(responses).clarity,
        maxScore: 10,
        feedback: 'Cultural fit assessment based on responses.',
      },
    };
  }

  private buildQuestionFeedback(responses: ResponseData[]): QuestionFeedbackItem[] {
    return responses.map((r, index) => ({
      questionId: `q_${index}`,
      question: r.question,
      category: r.category,
      answer: r.answer,
      scores: r.scores,
      feedback: this.generateQuestionFeedback(r),
      suggestions: [],
    }));
  }

  private generateQuestionFeedback(response: ResponseData): string {
    const { scores } = response;
    const parts: string[] = [];

    if (scores.overall >= 8) {
      parts.push('Excellent response.');
    } else if (scores.overall >= 6) {
      parts.push('Good response with room for improvement.');
    } else {
      parts.push('Response could be strengthened.');
    }

    if (scores.depth < 6) {
      parts.push('Consider providing more specific details and examples.');
    }

    if (scores.clarity < 6) {
      parts.push('Try to structure your answer more clearly.');
    }

    return parts.join(' ');
  }

  // ===================================================
  // PRIVATE: HELPERS
  // ===================================================

  private clampScore(score: number | undefined): number {
    if (typeof score !== 'number' || isNaN(score)) {
      return 5;
    }
    return Math.max(
      SCORING_CONFIG.MIN_SCORE,
      Math.min(SCORING_CONFIG.MAX_SCORE, Math.round(score * 10) / 10)
    );
  }

  private validateCategoryScores(data: any): CategoryScores {
    const defaultCategory = { score: 0, maxScore: 10, feedback: '' };

    return {
      technical: { ...defaultCategory, ...data?.technical },
      behavioral: { ...defaultCategory, ...data?.behavioral },
      communication: { ...defaultCategory, ...data?.communication },
      problemSolving: { ...defaultCategory, ...data?.problemSolving },
      cultureFit: { ...defaultCategory, ...data?.cultureFit },
    };
  }

  private validateHiringRecommendation(value: any): HiringRecommendation {
    const valid: HiringRecommendation[] = [
      'strong_yes',
      'yes',
      'maybe',
      'no',
      'strong_no',
    ];
    return valid.includes(value) ? value : 'maybe';
  }

  private validateDetailedAnalysis(data: any): DetailedAnalysis {
    return {
      technicalDepth: data?.technicalDepth || '',
      communicationStyle: data?.communicationStyle || '',
      problemSolvingApproach: data?.problemSolvingApproach || '',
      leadershipPotential: data?.leadershipPotential || '',
      growthMindset: data?.growthMindset || '',
    };
  }

  private scoreToRecommendation(score: number): HiringRecommendation {
    if (score >= 9) return 'strong_yes';
    if (score >= 7.5) return 'yes';
    if (score >= 6) return 'maybe';
    if (score >= 4) return 'no';
    return 'strong_no';
  }

  private generateSummaryFromScore(
    score: number,
    difficulty: AiInterviewDifficulty
  ): string {
    const level = difficulty.toLowerCase();

    if (score >= 8) {
      return `Excellent performance for a ${level}-level position. The candidate demonstrated strong skills and would be a valuable addition to the team.`;
    }
    if (score >= 6) {
      return `Good performance for a ${level}-level position. The candidate shows promise with some areas for development.`;
    }
    return `The candidate's performance for a ${level}-level position indicates significant areas for improvement.`;
  }

  private identifyStrengths(responses: ResponseData[]): string[] {
    const strengths: string[] = [];
    const avgScores = this.calculateAverageScores(responses);

    if (avgScores.clarity >= 7) strengths.push('Clear communication');
    if (avgScores.depth >= 7) strengths.push('Thorough explanations');
    if (avgScores.relevance >= 7) strengths.push('Relevant responses');
    if (avgScores.technicalAccuracy && avgScores.technicalAccuracy >= 7) {
      strengths.push('Strong technical knowledge');
    }

    return strengths.slice(0, 5);
  }

  private identifyImprovements(responses: ResponseData[]): string[] {
    const improvements: string[] = [];
    const avgScores = this.calculateAverageScores(responses);

    if (avgScores.clarity < 6) improvements.push('Improve response clarity');
    if (avgScores.depth < 6) improvements.push('Provide more detailed examples');
    if (avgScores.relevance < 6) improvements.push('Stay focused on the question');
    if (avgScores.technicalAccuracy && avgScores.technicalAccuracy < 6) {
      improvements.push('Strengthen technical knowledge');
    }

    return improvements.slice(0, 5);
  }

  private generateRecommendations(
    scores: ResponseScores,
    difficulty: AiInterviewDifficulty
  ): string[] {
    const recommendations: string[] = [];

    if (scores.depth < 7) {
      recommendations.push(
        'Practice the STAR method for behavioral questions'
      );
    }

    if (scores.technicalAccuracy && scores.technicalAccuracy < 7) {
      recommendations.push(
        'Review core technical concepts relevant to the role'
      );
    }

    if (scores.communication < 7) {
      recommendations.push(
        'Work on structuring responses with clear beginning, middle, and end'
      );
    }

    recommendations.push('Continue practicing with mock interviews');

    return recommendations.slice(0, 5);
  }

  private getDefaultScores(): ResponseScores {
    return {
      relevance: 5,
      clarity: 5,
      depth: 5,
      technicalAccuracy: null,
      communication: 5,
      overall: 5,
    };
  }

  private getMinimalResume(): StructuredResume {
    return {
      name: 'Candidate',
      email: '',
      phone: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };
  }

  private mapDbFeedbackToResponse(
    feedback: any,
    responses: any[]
  ): InterviewFeedback {
    const feedbackJson = (feedback.feedbackJson as Record<string, any>) || {};

    return {
      id: feedback.id,
      sessionId: feedback.sessionId,
      overallScore: Number(feedback.overallScore),
      overallSummary: feedback.overallSummary,
      categoryScores:
        feedbackJson.categoryScores || this.buildCategoryScoresFromResponses([]),
      keyStrengths: feedback.keyStrengths || [],
      areasForImprovement: feedback.areasForImprovement || [],
      questionFeedback: responses.map((r: any, index: number) => ({
        questionId: r.id,
        question: r.question,
        category: r.category,
        answer: r.answer,
        scores: (r.scoresJson as ResponseScores) || this.getDefaultScores(),
        feedback: r.feedbackText || '',
        suggestions: [],
      })),
      recommendations: feedbackJson.recommendations || [],
      hiringRecommendation: feedbackJson.hiringRecommendation || 'maybe',
      detailedAnalysis: feedbackJson.detailedAnalysis || {
        technicalDepth: '',
        communicationStyle: '',
        problemSolvingApproach: '',
        leadershipPotential: '',
        growthMindset: '',
      },
      generatedAt: feedback.createdAt,
    };
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const feedbackGeneratorService = new FeedbackGeneratorService();
export { FeedbackGeneratorService };