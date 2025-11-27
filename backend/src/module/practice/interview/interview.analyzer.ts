// interview.analyzer.ts

import { GroqApiManager } from '../../../utils/groq-manager';
import { logger } from '../../../utils/logger';
import {
  LiveSessionState,
  ResponseAnalysis,
  AnswerScore,
  INTERVIEW_CONFIG,
} from './interview.types';
import {
  sanitizeForPrompt,
  sanitizeStringArray,
  clampScore,
  clampPercentage,
  formatConversation,
  getNextTopic,
  validateTopic,
  extractErrorMessage,
} from './interview.utils';

// =====================================================
// TYPES
// =====================================================

export interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

export interface GeneratedFeedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  categoryScores: CategoryScore[];
  recommendations: string[];
}

// =====================================================
// ANALYZER CLASS
// =====================================================

export class InterviewAnalyzer {
  constructor(private readonly groqManager: GroqApiManager) {}

  // ===================================================
  // RESPONSE ANALYSIS
  // ===================================================

  /**
   * Analyze candidate's response
   */
  async analyzeResponse(
    liveState: LiveSessionState,
    transcript: string
  ): Promise<ResponseAnalysis> {
    if (transcript.trim().length < 10) {
      return this.getDefaultAnalysis(liveState);
    }

    const recentHistory = formatConversation(
      liveState.conversationHistory.slice(-6)
    );

    const sanitizedTranscript = sanitizeForPrompt(transcript);
    const sanitizedQuestion = sanitizeForPrompt(liveState.currentQuestion.text);

    const prompt = `Analyze this interview response for a ${sanitizeForPrompt(liveState.context.jobTitle)} position.

Conversation:
${recentHistory}

Current Question: "${sanitizedQuestion}"
Candidate's Answer: "${sanitizedTranscript}"

Provide analysis as JSON:
{
  "quality": "excellent|good|fair|needs_improvement|off_topic",
  "keyPoints": ["points the candidate made well"],
  "missingPoints": ["important points they missed"],
  "followUpOpportunities": ["specific aspects worth exploring further"],
  "scores": {
    "content": 0-10,
    "relevance": 0-10,
    "depth": 0-10,
    "clarity": 0-10
  },
  "shouldFollowUp": true/false,
  "followUpReason": "reason for follow-up decision",
  "suggestedNextTopic": "topic name if moving on",
  "topics": ["topics mentioned in the answer"]
}`;

    try {
      const result = await this.groqManager.generateJson<ResponseAnalysis>(prompt);
      return this.normalizeAnalysis(result, liveState);
    } catch (error) {
      logger.warn('[InterviewAnalyzer] Analysis failed, using defaults', {
        error: extractErrorMessage(error),
      });
      return this.getDefaultAnalysis(liveState);
    }
  }

  /**
   * Calculate scores from analysis
   */
  calculateScores(analysis: ResponseAnalysis): AnswerScore {
    const { scores } = analysis;
    const overall = Math.round(
      (scores.content + scores.relevance + scores.depth + scores.clarity) / 4
    );

    let feedback: string;
    if (overall >= 8) {
      feedback = 'Excellent response with strong detail and clarity.';
    } else if (overall >= 6) {
      feedback = 'Good response covering the key points.';
    } else if (overall >= 4) {
      feedback = 'Adequate response, could benefit from more depth or examples.';
    } else {
      feedback = 'Response needs more substance and specific examples.';
    }

    return {
      contentScore: scores.content,
      clarityScore: scores.clarity,
      relevanceScore: scores.relevance,
      depthScore: scores.depth,
      overallScore: overall,
      feedback,
    };
  }

  /**
   * Determine if follow-up is appropriate
   */
  shouldFollowUp(
    liveState: LiveSessionState,
    analysis: ResponseAnalysis
  ): boolean {
    if (liveState.topicDepth >= INTERVIEW_CONFIG.MAX_TOPIC_DEPTH) {
      return false;
    }

    if (
      analysis.quality === 'needs_improvement' ||
      analysis.quality === 'off_topic'
    ) {
      return false;
    }

    if (!analysis.followUpOpportunities.length) {
      return false;
    }

    if (liveState.topicDepth >= INTERVIEW_CONFIG.MAX_CONSECUTIVE_FOLLOWUPS) {
      return false;
    }

    const avgScore =
      (analysis.scores.content +
        analysis.scores.relevance +
        analysis.scores.depth +
        analysis.scores.clarity) /
      4;

    return avgScore >= 4 && avgScore <= 7 && analysis.shouldFollowUp;
  }

  // ===================================================
  // FEEDBACK GENERATION
  // ===================================================

  /**
   * Generate comprehensive feedback
   */
  async generateFeedback(
    jobTitle: string,
    transcript: string
  ): Promise<GeneratedFeedback> {
    const sanitizedTranscript = sanitizeForPrompt(transcript);

    const prompt = `Analyze this ${sanitizeForPrompt(jobTitle)} interview and provide comprehensive feedback.

Interview Transcript:
${sanitizedTranscript}

Provide feedback as JSON:
{
  "overallScore": 0-100,
  "summary": "2-3 paragraph comprehensive summary of the interview performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area for improvement 1", "area 2", "area 3"],
  "categoryScores": [
    { "category": "Technical Skills", "score": 0-100, "feedback": "specific feedback" },
    { "category": "Communication", "score": 0-100, "feedback": "specific feedback" },
    { "category": "Problem Solving", "score": 0-100, "feedback": "specific feedback" },
    { "category": "Experience", "score": 0-100, "feedback": "specific feedback" }
  ],
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}`;

    try {
      const result = await this.groqManager.generateJson<GeneratedFeedback>(prompt);
      return this.normalizeFeedback(result);
    } catch (error) {
      logger.error('[InterviewAnalyzer] Feedback generation failed', {
        error: extractErrorMessage(error),
      });
      return this.getDefaultFeedback();
    }
  }

  // ===================================================
  // PRIVATE HELPERS
  // ===================================================

  private normalizeAnalysis(
    raw: Partial<ResponseAnalysis>,
    liveState: LiveSessionState
  ): ResponseAnalysis {
    const validQualities = ['excellent', 'good', 'fair', 'needs_improvement', 'off_topic'];
    const quality = validQualities.includes(raw.quality || '')
      ? (raw.quality as ResponseAnalysis['quality'])
      : 'fair';

    return {
      quality,
      keyPoints: sanitizeStringArray(raw.keyPoints),
      missingPoints: sanitizeStringArray(raw.missingPoints),
      followUpOpportunities: sanitizeStringArray(raw.followUpOpportunities),
      scores: {
        content: clampScore(raw.scores?.content),
        relevance: clampScore(raw.scores?.relevance),
        depth: clampScore(raw.scores?.depth),
        clarity: clampScore(raw.scores?.clarity),
      },
      shouldFollowUp: Boolean(raw.shouldFollowUp),
      followUpReason: typeof raw.followUpReason === 'string' ? raw.followUpReason : undefined,
      suggestedNextTopic: validateTopic(raw.suggestedNextTopic) || getNextTopic(liveState),
      topics: sanitizeStringArray(raw.topics),
    };
  }

  private normalizeFeedback(raw: Partial<GeneratedFeedback>): GeneratedFeedback {
    const categoryScores: CategoryScore[] = Array.isArray(raw.categoryScores)
      ? raw.categoryScores.map((cs) => ({
          category: typeof cs.category === 'string' ? cs.category : 'Unknown',
          score: clampPercentage(cs.score),
          feedback: typeof cs.feedback === 'string' ? cs.feedback : '',
        }))
      : [];

    return {
      overallScore: clampPercentage(raw.overallScore),
      summary: typeof raw.summary === 'string' ? raw.summary : 'Interview completed.',
      strengths: sanitizeStringArray(raw.strengths),
      improvements: sanitizeStringArray(raw.improvements),
      categoryScores,
      recommendations: sanitizeStringArray(raw.recommendations),
    };
  }

  private getDefaultAnalysis(liveState: LiveSessionState): ResponseAnalysis {
    return {
      quality: 'fair',
      keyPoints: [],
      missingPoints: [],
      followUpOpportunities: [],
      scores: { content: 5, relevance: 5, depth: 5, clarity: 5 },
      shouldFollowUp: false,
      suggestedNextTopic: getNextTopic(liveState),
      topics: [],
    };
  }

  private getDefaultFeedback(): GeneratedFeedback {
    return {
      overallScore: 70,
      summary:
        'Thank you for completing the interview. Your responses have been recorded.',
      strengths: ['Participation', 'Engagement'],
      improvements: [
        'Provide more specific examples',
        'Elaborate on technical details',
      ],
      categoryScores: [],
      recommendations: [
        'Practice answering behavioral questions with the STAR method',
        'Prepare specific examples from your experience',
      ],
    };
  }
}