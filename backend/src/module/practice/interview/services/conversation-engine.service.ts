// src/module/practice/interview/services/conversation-engine.service.ts

import { AiInterviewDifficulty, AiInterviewQuestionCategory } from '@prisma/client';
import { nanoid } from 'nanoid';
import { GroqApiManager } from '../../../../utils/groq-manager';
import { logger } from '../../../../utils/logger';
import {
  ParsedResume,
  StructuredResume,
  CandidateProfile,
  ConversationContext,
  ConversationMessage,
  GeneratedQuestion,
  QuestionState,
  ResponseScores,
} from '../interview.types';
import {
  buildInterviewerSystemPrompt,
  buildConversationContext,
  buildOpeningPrompt,
  buildFollowUpPrompt,
  buildScoringPrompt,
  buildClosingPrompt,
  buildTopicTransitionPrompt,
} from '../interview.prompts';
import {
  AI_CONFIG,
  QUESTION_CATEGORIES,
  INTERVIEW_SESSION_CONFIG,
  DIFFICULTY_CONFIG,
} from '../interview.constants';
import { resumeParserService } from './resume-parser.service';

// =====================================================
// TYPES
// =====================================================

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

// =====================================================
// SERVICE CLASS
// =====================================================

class ConversationEngineService {
  private groq: GroqApiManager;

  constructor() {
    this.groq = new GroqApiManager();
  }

  // ===================================================
  // PUBLIC METHODS
  // ===================================================

  /**
   * Initialize a new conversation context
   * Updated to support Resuming Sessions by loading previous responses
   */
  async initializeContext(
    resume: ParsedResume,
    config: {
      jobTitle: string;
      companyName: string | null;
      difficulty: AiInterviewDifficulty;
      focusAreas: string[];
      targetQuestions: number;
    },
    previousResponses: any[] = [] // ADDED: Accept DB history
  ): Promise<ConversationContext> {
    const candidateProfile = resumeParserService.extractCandidateProfile(resume.structured);

    // Reconstruct History and Questions from DB Data
    const history: ConversationMessage[] = [];
    const questionsAsked: GeneratedQuestion[] = [];

    // Sort by order to ensure chronological history
    const sortedResponses = [...previousResponses].sort((a, b) => a.questionOrder - b.questionOrder);

    for (const resp of sortedResponses) {
      // 1. Add AI Question to History
      history.push({
        id: nanoid(),
        role: 'assistant',
        content: resp.question,
        timestamp: new Date(resp.createdAt)
      });

      // 2. Add User Answer to History (if answered)
      if (resp.answer) {
        history.push({
          id: nanoid(),
          role: 'user',
          content: resp.answer,
          timestamp: new Date(resp.updatedAt || resp.createdAt)
        });
      }

      // 3. Rebuild Questions Asked List
      questionsAsked.push({
        id: resp.id,
        category: resp.category,
        question: resp.question,
        order: resp.questionOrder,
        followUpPotential: []
      });
    }

    // Determine current topic based on last question
    const lastQuestion = questionsAsked[questionsAsked.length - 1];
    const currentTopic = lastQuestion ? lastQuestion.category : null;
    const followUpDepth = lastQuestion?.category && questionsAsked.length >= 2
      && questionsAsked[questionsAsked.length - 2].category === lastQuestion.category
      ? 1 : 0; // Simple approximation for depth

    return {
      resume,
      config: {
        resumeId: null,
        ...config,
      },
      history,
      questionsAsked,
      currentTopic,
      followUpDepth,
      candidateProfile,
    };
  }

  /**
   * Generate the opening message/question
   */
  async generateOpening(context: ConversationContext): Promise<QuestionGenerationResult> {
    logger.debug('[ConversationEngine] Generating opening');

    const systemPrompt = buildInterviewerSystemPrompt(
      context.resume.structured,
      context.candidateProfile,
      context.config.difficulty,
      context.config.jobTitle,
      context.config.companyName,
      context.config.focusAreas
    );

    const openingPrompt = buildOpeningPrompt(
      context.candidateProfile.name,
      context.config.jobTitle
    );

    const response = await this.groq.complete(
      openingPrompt,
      {
        systemPrompt,
        temperature: AI_CONFIG.LLM_TEMPERATURE,
        maxTokens: AI_CONFIG.LLM_MAX_TOKENS,
      }
    );

    return {
      question: response.trim(),
      category: 'INTRODUCTORY',
      isFollowUp: false,
    };
  }

  /**
   * Generate the next question based on conversation context
   */
  async generateNextQuestion(
    context: ConversationContext,
    candidateResponse?: string
  ): Promise<QuestionGenerationResult> {
    logger.debug('[ConversationEngine] Generating next question', {
      historyLength: context.history.length,
      questionsAsked: context.questionsAsked.length,
      followUpDepth: context.followUpDepth,
    });

    // Add candidate response to history if provided
    if (candidateResponse) {
      context.history.push({
        id: nanoid(),
        role: 'user',
        content: candidateResponse,
        timestamp: new Date(),
      });
    }

    // Determine if we should ask a follow-up or new question
    const shouldFollowUp = this.shouldAskFollowUp(context);
    const nextCategory = shouldFollowUp
      ? context.questionsAsked[context.questionsAsked.length - 1]?.category || 'TECHNICAL'
      : this.determineNextCategory(context);

    // Check if we should close the interview
    if (this.shouldCloseInterview(context)) {
      return this.generateClosingQuestion(context);
    }

    const systemPrompt = buildInterviewerSystemPrompt(
      context.resume.structured,
      context.candidateProfile,
      context.config.difficulty,
      context.config.jobTitle,
      context.config.companyName,
      context.config.focusAreas
    );

    const conversationContextPrompt = buildConversationContext(
      context.history,
      context.questionsAsked.map(q => q.question),
      context.currentTopic,
      context.followUpDepth
    );

    let userPrompt: string;

    if (shouldFollowUp && candidateResponse) {
      const lastQuestion = context.questionsAsked[context.questionsAsked.length - 1];
      userPrompt = buildFollowUpPrompt(
        lastQuestion?.question || '',
        candidateResponse,
        nextCategory
      );
    } else {
      userPrompt = `${conversationContextPrompt}\n\nGenerate the next ${nextCategory} question based on the candidate's profile and conversation so far.`;
    }

    const response = await this.groq.complete(
      userPrompt,
      {
        systemPrompt: `${systemPrompt}\n\n${conversationContextPrompt}`,
        temperature: AI_CONFIG.LLM_TEMPERATURE,
        maxTokens: AI_CONFIG.LLM_MAX_TOKENS,
      }
    );

    const question = response.trim();

    // Update context
    const generatedQuestion: GeneratedQuestion = {
      id: nanoid(),
      category: nextCategory,
      question,
      order: context.questionsAsked.length + 1,
      followUpPotential: [],
    };

    context.questionsAsked.push(generatedQuestion);
    context.history.push({
      id: nanoid(),
      role: 'assistant',
      content: question,
      timestamp: new Date(),
    });

    if (shouldFollowUp) {
      context.followUpDepth++;
    } else {
      context.followUpDepth = 0;
      context.currentTopic = nextCategory;
    }

    return {
      question,
      category: nextCategory,
      isFollowUp: shouldFollowUp,
      metadata: {
        expectedTopics: this.getExpectedTopics(context, nextCategory),
      },
    };
  }

  /**
   * Score a candidate's response
   */
  async scoreResponse(
    question: string,
    answer: string,
    category: AiInterviewQuestionCategory,
    context: ConversationContext
  ): Promise<ScoringResult> {
    logger.debug('[ConversationEngine] Scoring response');

    const expectedTopics = this.getExpectedTopics(context, category);

    const prompt = buildScoringPrompt(
      question,
      answer,
      category,
      context.config.difficulty,
      expectedTopics
    );

    try {
      const result = await this.groq.generateJson<ScoringResult>(prompt, {
        temperature: AI_CONFIG.FEEDBACK_TEMPERATURE,
        maxTokens: 500,
      });

      return {
        scores: this.validateScores(result.scores),
        feedback: result.feedback || '',
        strengths: result.strengths || [],
        improvements: result.improvements || [],
        shouldFollowUp: result.shouldFollowUp ?? false,
        followUpReason: result.followUpReason,
      };
    } catch (error) {
      logger.error('[ConversationEngine] Scoring failed', error);

      // Return default scores on failure
      return {
        scores: {
          relevance: 5,
          clarity: 5,
          depth: 5,
          technicalAccuracy: category === 'TECHNICAL' ? 5 : null,
          communication: 5,
          overall: 5,
        },
        feedback: 'Unable to generate detailed feedback.',
        strengths: [],
        improvements: [],
        shouldFollowUp: false,
      };
    }
  }

  /**
   * Generate transition to new topic
   */
  async generateTopicTransition(
    context: ConversationContext,
    nextCategory: AiInterviewQuestionCategory
  ): Promise<string> {
    const prompt = buildTopicTransitionPrompt(
      context.currentTopic || 'introduction',
      nextCategory,
      context.candidateProfile.primarySkills
    );

    const systemPrompt = buildInterviewerSystemPrompt(
      context.resume.structured,
      context.candidateProfile,
      context.config.difficulty,
      context.config.jobTitle,
      context.config.companyName,
      context.config.focusAreas
    );

    return this.groq.complete(prompt, {
      systemPrompt,
      temperature: AI_CONFIG.LLM_TEMPERATURE,
      maxTokens: AI_CONFIG.LLM_MAX_TOKENS,
    });
  }

  /**
   * Check if interview should end
   */
  shouldEndInterview(context: ConversationContext): boolean {
    return (
      context.questionsAsked.length >= context.config.targetQuestions ||
      this.hasCompletedAllCategories(context)
    );
  }

  /**
   * Get current question state
   */
  getCurrentQuestionState(context: ConversationContext): QuestionState | null {
    const lastQuestion = context.questionsAsked[context.questionsAsked.length - 1];
    if (!lastQuestion) return null;

    return {
      id: lastQuestion.id,
      category: lastQuestion.category,
      question: lastQuestion.question,
      order: lastQuestion.order,
      isFollowUp: context.followUpDepth > 0,
      startedAt: new Date(),
    };
  }

  // ===================================================
  // PRIVATE: QUESTION FLOW LOGIC
  // ===================================================

  private shouldAskFollowUp(context: ConversationContext): boolean {
    if (context.followUpDepth >= INTERVIEW_SESSION_CONFIG.MAX_FOLLOWUP_DEPTH) {
      return false;
    }

    if (context.questionsAsked.length === 0) {
      return false;
    }

    // Check if we have enough questions in the current category
    const lastCategory = context.questionsAsked[context.questionsAsked.length - 1]?.category;
    const categoryConfig = QUESTION_CATEGORIES[lastCategory as keyof typeof QUESTION_CATEGORIES];
    const categoryCount = context.questionsAsked.filter(q => q.category === lastCategory).length;

    if (categoryCount >= (categoryConfig?.maxCount || 3)) {
      return false;
    }

    // 50% chance of follow-up based on difficulty
    const difficultyConfig = DIFFICULTY_CONFIG[context.config.difficulty];
    const followUpChance = difficultyConfig.followUpIntensity === 'high' ? 0.7 :
      difficultyConfig.followUpIntensity === 'medium' ? 0.5 : 0.3;

    return Math.random() < followUpChance;
  }

  private determineNextCategory(context: ConversationContext): AiInterviewQuestionCategory {
    const categoryCounts: Record<AiInterviewQuestionCategory, number> = {
      INTRODUCTORY: 0,
      TECHNICAL: 0,
      BEHAVIORAL: 0,
      SITUATIONAL: 0,
      CLOSING: 0,
    };

    for (const q of context.questionsAsked) {
      categoryCounts[q.category]++;
    }

    // Priority: Technical > Behavioral > Situational > Closing
    const priorities: AiInterviewQuestionCategory[] = [
      'TECHNICAL',
      'BEHAVIORAL',
      'SITUATIONAL',
      'CLOSING',
    ];

    for (const category of priorities) {
      const config = QUESTION_CATEGORIES[category];
      if (categoryCounts[category] < config.minCount) {
        return category;
      }
    }

    // If minimums are met, choose based on weights
    const targetTotal = context.config.targetQuestions;
    const remaining = targetTotal - context.questionsAsked.length;

    if (remaining <= 1) {
      return 'CLOSING';
    }

    // Weighted random selection
    const weights: [AiInterviewQuestionCategory, number][] = [
      ['TECHNICAL', QUESTION_CATEGORIES.TECHNICAL.weight],
      ['BEHAVIORAL', QUESTION_CATEGORIES.BEHAVIORAL.weight],
      ['SITUATIONAL', QUESTION_CATEGORIES.SITUATIONAL.weight],
    ];

    const totalWeight = weights.reduce((sum, [_, w]) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (const [category, weight] of weights) {
      random -= weight;
      if (random <= 0) {
        const config = QUESTION_CATEGORIES[category];
        if (categoryCounts[category] < config.maxCount) {
          return category;
        }
      }
    }

    return 'TECHNICAL';
  }

  private shouldCloseInterview(context: ConversationContext): boolean {
    const remaining = context.config.targetQuestions - context.questionsAsked.length;
    return remaining <= 1 && !context.questionsAsked.some(q => q.category === 'CLOSING');
  }

  private hasCompletedAllCategories(context: ConversationContext): boolean {
    const categories: AiInterviewQuestionCategory[] = [
      'INTRODUCTORY',
      'TECHNICAL',
      'BEHAVIORAL',
    ];

    return categories.every(category => {
      const count = context.questionsAsked.filter(q => q.category === category).length;
      return count >= QUESTION_CATEGORIES[category].minCount;
    });
  }

  private async generateClosingQuestion(context: ConversationContext): Promise<QuestionGenerationResult> {
    const prompt = buildClosingPrompt(context.candidateProfile.name);

    const response = await this.groq.complete(prompt, {
      temperature: 0.5,
      maxTokens: 300,
    });

    const question = response.trim();

    context.questionsAsked.push({
      id: nanoid(),
      category: 'CLOSING',
      question,
      order: context.questionsAsked.length + 1,
      followUpPotential: [],
    });

    context.history.push({
      id: nanoid(),
      role: 'assistant',
      content: question,
      timestamp: new Date(),
    });

    return {
      question,
      category: 'CLOSING',
      isFollowUp: false,
    };
  }

  // ===================================================
  // PRIVATE: HELPERS
  // ===================================================

  private getExpectedTopics(
    context: ConversationContext,
    category: AiInterviewQuestionCategory
  ): string[] {
    switch (category) {
      case 'TECHNICAL':
        return context.candidateProfile.primarySkills;
      case 'BEHAVIORAL':
        return ['teamwork', 'conflict resolution', 'leadership', 'communication'];
      case 'SITUATIONAL':
        return ['problem-solving', 'decision-making', 'prioritization'];
      default:
        return [];
    }
  }

  private validateScores(scores: Partial<ResponseScores>): ResponseScores {
    const clamp = (value: number | undefined | null, min: number, max: number): number => {
      if (value === undefined || value === null) return Math.round((min + max) / 2);
      return Math.max(min, Math.min(max, Math.round(value)));
    };

    return {
      relevance: clamp(scores.relevance, 1, 10),
      clarity: clamp(scores.clarity, 1, 10),
      depth: clamp(scores.depth, 1, 10),
      technicalAccuracy: scores.technicalAccuracy !== null
        ? clamp(scores.technicalAccuracy, 1, 10)
        : null,
      communication: clamp(scores.communication, 1, 10),
      overall: clamp(scores.overall, 1, 10),
    };
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const conversationEngineService = new ConversationEngineService();
export { ConversationEngineService };