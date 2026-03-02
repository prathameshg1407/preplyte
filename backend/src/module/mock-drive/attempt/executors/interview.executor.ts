// src/module/mock-drive/attempt/executors/interview.executor.ts

import { PrismaClient, AiInterviewQuestionCategory } from '@prisma/client';
import { nanoid } from 'nanoid';
import {
  BaseModuleExecutor,
  ModuleExecutorContext,
  InitializeResult,
  SubmitResult,
} from './base.executor';
import {
  AiInterviewModuleConfig,
  AiInterviewModuleData,
  AiInterviewConfig,
  ConversationMessage,
  InterviewResponseData,
  ResponseScores,
  CategoryScore,
  InterviewModuleSummary,
  ModuleData,
} from '../../shared';
import { NotFoundError, BadRequestError } from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';

// Import services from practice interview module
import {
  conversationEngineService,
  resumeParserService,
  textToSpeechService,
  speechToTextService,
} from '../../../practice/interview/services';

import type {
  ConversationContext,
  ParsedResume,
  ResponseScores as PracticeResponseScores,
  ConversationMessage as PracticeConversationMessage,
} from '../../../practice/interview/interview.types';

// ============================================
// Types
// ============================================

interface RespondPayload {
  answer: string;
  timeTaken?: number;
  audioBuffer?: string;
}

interface SkipPayload {
  reason?: string;
}

interface AudioChunkPayload {
  chunk: string;
  isFinal?: boolean;
}

interface WorkingInterviewData {
  config: AiInterviewConfig;
  conversation: ConversationMessage[];
  responses: InterviewResponseData[];
  summary?: InterviewModuleSummary;
  isVoiceEnabled?: boolean;
  pendingTranscription?: string;
}

interface RuntimeContext {
  conversationContext: ConversationContext;
  parsedResume: ParsedResume;
}

// ============================================
// Constants
// ============================================

const VALID_ACTIONS = [
  'respond',
  'skip',
  'start_voice',
  'audio_chunk',
  'get_audio_question',
  'end_early',
] as const;
type InterviewAction = typeof VALID_ACTIONS[number];

const PASSING_SCORE = 60;

// ============================================
// Type Guards
// ============================================

function isRespondPayload(payload: unknown): payload is RespondPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  return typeof (payload as Record<string, unknown>).answer === 'string';
}

function isSkipPayload(payload: unknown): payload is SkipPayload {
  return typeof payload === 'object' && payload !== null;
}

function isAudioChunkPayload(payload: unknown): payload is AudioChunkPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  return typeof (payload as Record<string, unknown>).chunk === 'string';
}

function isInterviewAction(action: string): action is InterviewAction {
  return VALID_ACTIONS.includes(action as InterviewAction);
}

function hasInterviewStructure(data: unknown): data is WorkingInterviewData {
  if (data === null || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    'config' in d &&
    'conversation' in d &&
    'responses' in d &&
    Array.isArray(d.conversation) &&
    Array.isArray(d.responses)
  );
}

// ============================================
// Type Adapters
// ============================================

function toPracticeMessage(msg: ConversationMessage): PracticeConversationMessage {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    metadata: undefined,
  };
}

// src/module/mock-drive/attempt/executors/interview.executor.ts (continued)

function toMockDriveScores(scores: PracticeResponseScores): ResponseScores {
  return {
    relevance: scores.relevance,
    clarity: scores.clarity,
    depth: scores.depth,
    technicalAccuracy: scores.technicalAccuracy,
    overall: scores.overall,
  };
}

// ============================================
// Executor Implementation
// ============================================

export class InterviewModuleExecutor extends BaseModuleExecutor {
  private readonly runtimeContexts = new Map<string, RuntimeContext>();

  constructor(prisma: PrismaClient) {
    super(prisma, 'AI_INTERVIEW');
  }

  async initialize(context: ModuleExecutorContext): Promise<InitializeResult> {
    this.validateContext(context);

    const config = context.config as AiInterviewModuleConfig;

    logger.info('[MockDrive:Interview] Initializing interview module', {
      userId: context.userId,
      jobTitle: config.jobTitle,
      difficulty: config.difficulty,
    });

    // Get user's default resume
    const resume = await this.getDefaultResume(context.userId);
    if (!resume) {
      throw new NotFoundError('Resume. Please upload a resume first');
    }

    // Parse resume
    const parsedResume = await this.parseResume(context.userId, resume);

    // Initialize conversation context
    const conversationContext = await conversationEngineService.initializeContext(
      parsedResume,
      {
        jobTitle: config.jobTitle,
        companyName: config.companyName || null,
        difficulty: config.difficulty,
        focusAreas: config.focusAreas || [],
        targetQuestions: config.targetQuestions,
      }
    );

    // Generate opening
    const opening = await conversationEngineService.generateOpening(conversationContext);

    // Cache runtime context
    this.runtimeContexts.set(context.moduleAttemptId, {
      conversationContext,
      parsedResume,
    });

    const initialMessage: ConversationMessage = {
      id: nanoid(),
      role: 'assistant',
      content: opening.question,
      timestamp: new Date().toISOString(),
    };

    const interviewConfig: AiInterviewConfig = {
      resumeId: resume.id,
      resumeUrl: resume.fileUrl,
      jobTitle: config.jobTitle,
      companyName: config.companyName || null,
      difficulty: config.difficulty,
      focusAreas: config.focusAreas || [],
      targetQuestions: config.targetQuestions,
    };

    const data: Partial<WorkingInterviewData> = {
      config: interviewConfig,
      conversation: [initialMessage],
      responses: [],
      isVoiceEnabled: false,
    };

    logger.info('[MockDrive:Interview] Interview initialized successfully');

    return { data };
  }

  async handleAction(
    context: ModuleExecutorContext,
    action: string,
    payload: unknown
  ): Promise<Partial<ModuleData>> {
    if (!isInterviewAction(action)) {
      throw new BadRequestError(`Unknown action: ${action}`);
    }

    if (!hasInterviewStructure(context.existingData)) {
      throw new BadRequestError('Module not properly initialized');
    }

    const data = context.existingData;
    const runtimeContext = await this.getOrRebuildRuntimeContext(context, data);

    logger.debug('[MockDrive:Interview] Handling action', { action });

    switch (action) {
      case 'respond':
        return this.handleRespond(context, data, runtimeContext, payload);
      case 'skip':
        return this.handleSkip(context, data, runtimeContext, payload);
      case 'start_voice':
        return this.handleStartVoice();
      case 'audio_chunk':
        return this.handleAudioChunk(data, payload);
      case 'get_audio_question':
        return this.handleGetAudioQuestion(data);
      case 'end_early':
        return this.handleEndEarly(data);
    }
  }

  async finalize(context: ModuleExecutorContext): Promise<SubmitResult> {
    if (!hasInterviewStructure(context.existingData)) {
      throw new BadRequestError('Module data not found');
    }

    const data = context.existingData;
    const config = context.config as AiInterviewModuleConfig;

    logger.info('[MockDrive:Interview] Finalizing interview', {
      responseCount: data.responses.length,
      targetQuestions: config.targetQuestions,
    });

    // Calculate scores
    const categoryScores = this.calculateCategoryScores(data.responses);
    const { overallScore, answeredCount } = this.calculateOverallScore(data.responses);

    // Generate feedback
    const feedback = this.generateFeedbackSummary(data, config, overallScore);

    // Build summary
    const summary: InterviewModuleSummary = {
      totalQuestions: config.targetQuestions,
      questionsAnswered: answeredCount,
      overallScore,
      maxScore: 100,
      categoryScores,
      keyStrengths: feedback.strengths,
      areasForImprovement: feedback.improvements,
      overallFeedback: feedback.summary,
    };

    // Add closing message
    const finalConversation = this.addClosingMessage(data.conversation);

    const finalData: AiInterviewModuleData = {
      config: data.config,
      conversation: finalConversation,
      responses: data.responses,
      summary,
    };

    // Cleanup runtime context
    this.runtimeContexts.delete(context.moduleAttemptId);

    logger.info('[MockDrive:Interview] Interview finalized', {
      overallScore,
      isPassed: overallScore >= PASSING_SCORE,
    });

    return {
      data: finalData,
      score: overallScore,
      maxScore: 100,
      percentage: overallScore,
      isPassed: overallScore >= PASSING_SCORE,
    };
  }

  // ============================================
  // Action Handlers
  // ============================================

  private async handleRespond(
    context: ModuleExecutorContext,
    data: WorkingInterviewData,
    runtimeContext: RuntimeContext,
    payload: unknown
  ): Promise<Partial<WorkingInterviewData>> {
    if (!isRespondPayload(payload)) {
      throw new BadRequestError('Invalid respond payload: answer is required');
    }

    const config = context.config as AiInterviewModuleConfig;
    let answer = payload.answer;

    // Transcribe audio if provided
    if (payload.audioBuffer) {
      answer = await this.transcribeAudio(payload.audioBuffer);
    }

    // Get current question
    const lastQuestion = this.getLastAssistantMessage(data.conversation);
    if (!lastQuestion) {
      throw new BadRequestError('No question to answer');
    }

    // Add user message
    const userMessage = this.createMessage('user', answer);

    // Determine question category
    const category = this.inferCategory(data.responses.length, config.targetQuestions);

    // Score response
    const scoringResult = await conversationEngineService.scoreResponse(
      lastQuestion.content,
      answer,
      category,
      runtimeContext.conversationContext
    );

    // Create response record
    const response: InterviewResponseData = {
      id: nanoid(),
      questionIndex: data.responses.length,
      category,
      question: lastQuestion.content,
      answer,
      isFollowup: false,
      scores: toMockDriveScores(scoringResult.scores),
      feedback: scoringResult.feedback,
      timeTakenSeconds: payload.timeTaken || 0,
      answeredAt: new Date().toISOString(),
    };

    const updatedConversation = [...data.conversation, userMessage];
    const updatedResponses = [...data.responses, response];

    // Generate next question if needed
    if (updatedResponses.length < config.targetQuestions) {
      const nextQuestion = await this.generateNextQuestion(runtimeContext, answer);
      updatedConversation.push(nextQuestion);
    }

    return {
      conversation: updatedConversation,
      responses: updatedResponses,
      pendingTranscription: '',
    };
  }

  private async handleSkip(
    context: ModuleExecutorContext,
    data: WorkingInterviewData,
    runtimeContext: RuntimeContext,
    payload: unknown
  ): Promise<Partial<WorkingInterviewData>> {
    if (!isSkipPayload(payload)) {
      throw new BadRequestError('Invalid skip payload');
    }

    const config = context.config as AiInterviewModuleConfig;

    const lastQuestion = this.getLastAssistantMessage(data.conversation);
    if (!lastQuestion) {
      throw new BadRequestError('No question to skip');
    }

    const category = this.inferCategory(data.responses.length, config.targetQuestions);

    // Create skipped response
    const response: InterviewResponseData = {
      id: nanoid(),
      questionIndex: data.responses.length,
      category,
      question: lastQuestion.content,
      answer: '[SKIPPED]',
      isFollowup: false,
      scores: this.createZeroScores(),
      feedback: payload.reason || 'Question was skipped.',
      timeTakenSeconds: 0,
      answeredAt: new Date().toISOString(),
    };

    const skipMessage = this.createMessage('user', '[Skipped]');
    const updatedConversation = [...data.conversation, skipMessage];
    const updatedResponses = [...data.responses, response];

    // Generate next question if needed
    if (updatedResponses.length < config.targetQuestions) {
      const nextQuestion = await this.generateNextQuestion(runtimeContext);
      updatedConversation.push(nextQuestion);
    }

    return {
      conversation: updatedConversation,
      responses: updatedResponses,
      pendingTranscription: '',
    };
  }

  private handleStartVoice(): Partial<WorkingInterviewData> {
    return { isVoiceEnabled: true };
  }

  private async handleAudioChunk(
    data: WorkingInterviewData,
    payload: unknown
  ): Promise<Partial<WorkingInterviewData>> {
    if (!isAudioChunkPayload(payload)) {
      throw new BadRequestError('Invalid audio chunk payload');
    }

    const transcription = await this.transcribeAudio(payload.chunk);
    const currentTranscription = data.pendingTranscription || '';

    return {
      pendingTranscription: `${currentTranscription} ${transcription}`.trim(),
    };
  }

  private async handleGetAudioQuestion(
    data: WorkingInterviewData
  ): Promise<Partial<WorkingInterviewData>> {
    const lastQuestion = this.getLastAssistantMessage(data.conversation);
    if (!lastQuestion) {
      throw new BadRequestError('No question available');
    }

    try {
      const ttsResult = await textToSpeechService.synthesize({
        text: lastQuestion.content,
      });

      return {
        pendingTranscription: `AUDIO:${ttsResult.audioBuffer.toString('base64')}`,
      };
    } catch (error) {
      logger.error('[MockDrive:Interview] TTS generation failed', error);
      throw new BadRequestError('Failed to generate audio question');
    }
  }

  private handleEndEarly(data: WorkingInterviewData): Partial<WorkingInterviewData> {
    const closingMessage = this.createMessage(
      'assistant',
      'Thank you for participating in this interview. Your session has been concluded early.'
    );

    return {
      conversation: [...data.conversation, closingMessage],
    };
  }

  // ============================================
  // Helper Methods - Resume
  // ============================================

  private async getDefaultResume(userId: string) {
    return this.prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });
  }

  private async parseResume(
    userId: string,
    resume: { id: string; fileUrl: string }
  ): Promise<ParsedResume> {
    try {
      return await resumeParserService.parseResumeById(userId, resume.id);
    } catch (error) {
      logger.error('[MockDrive:Interview] Resume parsing failed', error);
      return this.createMinimalResume(resume);
    }
  }

  private createMinimalResume(resume: { id: string; fileUrl: string }): ParsedResume {
    return {
      rawText: '',
      structured: {
        name: 'Candidate',
        email: '',
        phone: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
      },
      hash: resume.id,
      parsedAt: new Date(),
    };
  }

  // ============================================
  // Helper Methods - Runtime Context
  // ============================================

  private async getOrRebuildRuntimeContext(
    context: ModuleExecutorContext,
    data: WorkingInterviewData
  ): Promise<RuntimeContext> {
    const cached = this.runtimeContexts.get(context.moduleAttemptId);
    if (cached) {
      return cached;
    }

    // Rebuild from stored data
    const resume = { id: data.config.resumeId, fileUrl: data.config.resumeUrl };
    const parsedResume = await this.parseResume(context.userId, resume);

    const conversationContext = await conversationEngineService.initializeContext(
      parsedResume,
      {
        jobTitle: data.config.jobTitle,
        companyName: data.config.companyName,
        difficulty: data.config.difficulty,
        focusAreas: data.config.focusAreas,
        targetQuestions: data.config.targetQuestions,
      }
    );

    // Replay conversation history
    for (const msg of data.conversation) {
      conversationContext.history.push(toPracticeMessage(msg));
    }

    // Restore questions asked
    for (const response of data.responses) {
      conversationContext.questionsAsked.push({
        id: response.id,
        category: response.category,
        question: response.question,
        order: response.questionIndex,
        followUpPotential: [],
      });
    }

    const runtimeContext: RuntimeContext = { conversationContext, parsedResume };
    this.runtimeContexts.set(context.moduleAttemptId, runtimeContext);

    return runtimeContext;
  }

  // ============================================
  // Helper Methods - Conversation
  // ============================================

  private createMessage(
    role: 'user' | 'assistant',
    content: string
  ): ConversationMessage {
    return {
      id: nanoid(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
  }

  private getLastAssistantMessage(
    conversation: ConversationMessage[]
  ): ConversationMessage | undefined {
    return [...conversation].reverse().find((m) => m.role === 'assistant');
  }

  private async generateNextQuestion(
    runtimeContext: RuntimeContext,
    previousAnswer?: string
  ): Promise<ConversationMessage> {
    const result = await conversationEngineService.generateNextQuestion(
      runtimeContext.conversationContext,
      previousAnswer
    );

    return this.createMessage('assistant', result.question);
  }

  private addClosingMessage(conversation: ConversationMessage[]): ConversationMessage[] {
    const closingText = 'Thank you for completing this interview. Your responses have been recorded and analyzed.';
    const lastMessage = conversation[conversation.length - 1];

    if (lastMessage?.content === closingText) {
      return conversation;
    }

    return [...conversation, this.createMessage('assistant', closingText)];
  }

  // ============================================
  // Helper Methods - Audio
  // ============================================

  private async transcribeAudio(base64Audio: string): Promise<string> {
    try {
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      const transcription = await speechToTextService.transcribeBuffer(audioBuffer);
      return transcription.text;
    } catch (error) {
      logger.error('[MockDrive:Interview] Audio transcription failed', error);
      throw new BadRequestError('Failed to transcribe audio response');
    }
  }

  // ============================================
  // Helper Methods - Scoring
  // ============================================

  private createZeroScores(): ResponseScores {
    return {
      relevance: 0,
      clarity: 0,
      depth: 0,
      technicalAccuracy: null,
      overall: 0,
    };
  }

  private calculateOverallScore(responses: InterviewResponseData[]): {
    overallScore: number;
    answeredCount: number;
  } {
    let totalScore = 0;
    let answeredCount = 0;

    for (const response of responses) {
      if (response.answer !== '[SKIPPED]') {
        totalScore += response.scores.overall;
        answeredCount++;
      }
    }

    const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;
    const overallScore = averageScore * 10; // Scale to 100

    return { overallScore, answeredCount };
  }

  private calculateCategoryScores(
    responses: InterviewResponseData[]
  ): Record<AiInterviewQuestionCategory, CategoryScore> {
    const scores: Record<AiInterviewQuestionCategory, CategoryScore> = {
      INTRODUCTORY: { score: 0, count: 0 },
      TECHNICAL: { score: 0, count: 0 },
      BEHAVIORAL: { score: 0, count: 0 },
      SITUATIONAL: { score: 0, count: 0 },
      CLOSING: { score: 0, count: 0 },
    };

    for (const response of responses) {
      if (response.answer !== '[SKIPPED]') {
        scores[response.category].score += response.scores.overall;
        scores[response.category].count++;
      }
    }

    // Normalize scores
    for (const category of Object.keys(scores) as AiInterviewQuestionCategory[]) {
      if (scores[category].count > 0) {
        scores[category].score = Math.round(
          (scores[category].score / scores[category].count) * 10
        ) / 10;
      }
    }

    return scores;
  }

  private inferCategory(
    questionIndex: number,
    totalQuestions: number
  ): AiInterviewQuestionCategory {
    const ratio = questionIndex / totalQuestions;

    if (ratio < 0.15) return 'INTRODUCTORY';
    if (ratio < 0.5) return 'TECHNICAL';
    if (ratio < 0.75) return 'BEHAVIORAL';
    if (ratio < 0.9) return 'SITUATIONAL';
    return 'CLOSING';
  }

  // ============================================
  // Helper Methods - Feedback
  // ============================================

  private generateFeedbackSummary(
    data: WorkingInterviewData,
    config: AiInterviewModuleConfig,
    overallScore: number
  ): {
    summary: string;
    strengths: string[];
    improvements: string[];
  } {
    const avgScores = this.calculateAverageScoresByDimension(data.responses);
    const strengths = this.identifyStrengths(avgScores);
    const improvements = this.identifyImprovements(avgScores);
    const summary = this.generateSummaryText(config.jobTitle, overallScore);

    return {
      summary,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
    };
  }

  private calculateAverageScoresByDimension(responses: InterviewResponseData[]): {
    relevance: number;
    clarity: number;
    depth: number;
    technical: number;
  } {
    const totals = { relevance: 0, clarity: 0, depth: 0, technical: 0 };
    let count = 0;
    let techCount = 0;

    for (const response of responses) {
      if (response.answer !== '[SKIPPED]') {
        totals.relevance += response.scores.relevance;
        totals.clarity += response.scores.clarity;
        totals.depth += response.scores.depth;
        count++;

        if (response.scores.technicalAccuracy !== null) {
          totals.technical += response.scores.technicalAccuracy;
          techCount++;
        }
      }
    }

    return {
      relevance: count > 0 ? totals.relevance / count : 0,
      clarity: count > 0 ? totals.clarity / count : 0,
      depth: count > 0 ? totals.depth / count : 0,
      technical: techCount > 0 ? totals.technical / techCount : 0,
    };
  }

  private identifyStrengths(scores: {
    relevance: number;
    clarity: number;
    depth: number;
    technical: number;
  }): string[] {
    const strengths: string[] = [];

    if (scores.relevance >= 7) {
      strengths.push('Provides relevant and on-topic responses');
    }
    if (scores.clarity >= 7) {
      strengths.push('Communicates ideas clearly and effectively');
    }
    if (scores.depth >= 7) {
      strengths.push('Demonstrates thorough understanding with detailed answers');
    }
    if (scores.technical >= 7) {
      strengths.push('Shows strong technical knowledge');
    }

    if (strengths.length === 0) {
      strengths.push('Completed the interview');
      strengths.push('Showed willingness to engage');
    }

    return strengths;
  }

  private identifyImprovements(scores: {
    relevance: number;
    clarity: number;
    depth: number;
    technical: number;
  }): string[] {
    const improvements: string[] = [];

    if (scores.relevance < 6) {
      improvements.push('Focus more directly on the questions asked');
    }
    if (scores.clarity < 6) {
      improvements.push('Work on organizing responses more clearly');
    }
    if (scores.depth < 6) {
      improvements.push('Provide more specific examples and details');
    }
    if (scores.technical < 6 && scores.technical > 0) {
      improvements.push('Strengthen technical fundamentals');
    }

    if (improvements.length === 0) {
      improvements.push('Continue practicing interview skills');
    }

    return improvements;
  }

  private generateSummaryText(jobTitle: string, overallScore: number): string {
    if (overallScore >= 80) {
      return `Excellent interview performance for the ${jobTitle} position. The candidate demonstrated strong communication skills and provided well-structured responses.`;
    }
    if (overallScore >= 60) {
      return `Good interview performance for the ${jobTitle} position. The candidate showed competence with some areas for improvement.`;
    }
    if (overallScore >= 40) {
      return `Satisfactory interview performance for the ${jobTitle} position. Additional preparation would be beneficial.`;
    }
    return `The interview revealed areas for development. Focus on strengthening core competencies and interview skills.`;
  }
}