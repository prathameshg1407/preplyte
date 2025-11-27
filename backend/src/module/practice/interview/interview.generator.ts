// interview.generator.ts

import { AiInterviewQuestionCategory } from '@prisma/client';
import { GroqApiManager } from '../../../utils/groq-manager';
import { logger } from '../../../utils/logger';
import {
  LiveSessionState,
  SessionContext,
  QuestionItem,
  ResponseAnalysis,
  INTERVIEW_CONFIG,
} from './interview.types';
import {
  sanitizeForPrompt,
  formatConversation,
  mapCategory,
} from './interview.utils';

// =====================================================
// TYPES
// =====================================================

export interface GeneratedQuestion {
  question: QuestionItem;
  isFollowUp: boolean;
  transition?: string;
}

// =====================================================
// GENERATOR CLASS
// =====================================================

export class InterviewGenerator {
  constructor(private readonly groqManager: GroqApiManager) {}

  // ===================================================
  // OPENING QUESTION
  // ===================================================

  /**
   * Generate opening/welcome question
   */
  async generateOpeningQuestion(context: SessionContext): Promise<QuestionItem> {
    const companyPart = context.companyName ? ` at ${context.companyName}` : '';
    const resumePart = context.resumeText
      ? `\nCandidate background: ${context.resumeText.slice(0, 300)}`
      : '';

    const prompt = `Generate an opening question for a ${sanitizeForPrompt(context.jobTitle)}${companyPart} interview.
${resumePart}
Difficulty level: ${context.difficulty}

Create a warm, welcoming question that:
1. Makes the candidate feel comfortable
2. Invites them to introduce themselves and their background
3. Sets a conversational, friendly tone
4. Is specific to the role when possible

Respond with JSON:
{ "question": "your opening question" }`;

    try {
      const result = await this.groqManager.generateJson<{ question: string }>(prompt);
      return {
        category: AiInterviewQuestionCategory.INTRODUCTORY,
        text: typeof result.question === 'string'
          ? result.question
          : this.getDefaultOpeningQuestion(context),
      };
    } catch (error) {
      logger.warn('[InterviewGenerator] Opening question generation failed');
      return {
        category: AiInterviewQuestionCategory.INTRODUCTORY,
        text: this.getDefaultOpeningQuestion(context),
      };
    }
  }

  // ===================================================
  // NEXT QUESTION
  // ===================================================

  /**
   * Generate next question based on context and analysis
   */
  async generateNextQuestion(
    liveState: LiveSessionState,
    analysis: ResponseAnalysis,
    shouldFollowUp: boolean
  ): Promise<GeneratedQuestion> {
    if (shouldFollowUp) {
      const question = await this.generateFollowUp(liveState, analysis);
      return { question, isFollowUp: true };
    }

    const question = await this.generateNewTopicQuestion(liveState, analysis);
    const transition = `Great, let's move on to discuss ${analysis.suggestedNextTopic || 'another area'}.`;

    return { question, isFollowUp: false, transition };
  }

  // ===================================================
  // FOLLOW-UP QUESTIONS
  // ===================================================

  /**
   * Generate a follow-up question
   */
  async generateFollowUp(
    liveState: LiveSessionState,
    analysis: ResponseAnalysis
  ): Promise<QuestionItem> {
    const recentConvo = formatConversation(
      liveState.conversationHistory.slice(-4)
    );

    const prompt = `Generate a follow-up question for this ${sanitizeForPrompt(liveState.context.jobTitle)} interview.

Recent conversation:
${recentConvo}

Their answer quality: ${analysis.quality}
Key points they made: ${analysis.keyPoints.join(', ') || 'None identified'}
Opportunity to explore: ${analysis.followUpOpportunities[0] || 'general elaboration'}

Create a natural follow-up that:
1. References something specific they said
2. Asks for elaboration, an example, or more detail
3. Feels conversational, not interrogative
4. Helps them demonstrate more depth

Respond with JSON:
{
  "transition": "brief acknowledgment of their answer",
  "question": "your follow-up question",
  "category": "TECHNICAL|BEHAVIORAL|SITUATIONAL"
}`;

    try {
      const result = await this.groqManager.generateJson<{
        transition?: string;
        question: string;
        category: string;
      }>(prompt);

      const questionText = typeof result.question === 'string' ? result.question : '';
      const transitionText = typeof result.transition === 'string' ? result.transition : '';

      const text = transitionText
        ? `${transitionText} ${questionText}`
        : questionText;

      if (!text.trim()) {
        throw new Error('Empty question generated');
      }

      return {
        category: mapCategory(result.category),
        text,
      };
    } catch (error) {
      logger.warn('[InterviewGenerator] Follow-up generation failed');
      return {
        category: liveState.currentQuestion.category,
        text: "That's interesting. Could you elaborate on that? Maybe give me a specific example?",
      };
    }
  }

  // ===================================================
  // NEW TOPIC QUESTIONS
  // ===================================================

  /**
   * Generate question for a new topic
   */
  async generateNewTopicQuestion(
    liveState: LiveSessionState,
    analysis: ResponseAnalysis
  ): Promise<QuestionItem> {
    const nextTopic = analysis.suggestedNextTopic;
    liveState.coveredTopics.add(nextTopic);

    const recentConvo = formatConversation(
      liveState.conversationHistory.slice(-4)
    );

    const shouldClose =
      liveState.questionCount >= INTERVIEW_CONFIG.TARGET_QUESTIONS - 1 ||
      liveState.coveredTopics.size >= INTERVIEW_CONFIG.MIN_TOPICS_TO_COVER;

    const prompt = `Generate a ${shouldClose ? 'closing' : 'new'} question about "${sanitizeForPrompt(nextTopic)}" for this ${sanitizeForPrompt(liveState.context.jobTitle)} interview.

Recent conversation:
${recentConvo}

Topics already covered: ${Array.from(liveState.coveredTopics).join(', ')}
Question #${liveState.questionCount + 1} of ~${INTERVIEW_CONFIG.TARGET_QUESTIONS}
Difficulty: ${liveState.context.difficulty}
${shouldClose ? 'This should be a closing/wrap-up question.' : ''}

Create a question that:
1. Smoothly transitions from the previous topic
2. Briefly acknowledges their last answer
3. ${shouldClose ? 'Wraps up the interview warmly' : 'Opens a new area of discussion'}

Respond with JSON:
{
  "transition": "brief transition phrase",
  "question": "your question",
  "category": "${shouldClose ? 'CLOSING' : 'TECHNICAL|BEHAVIORAL|SITUATIONAL'}"
}`;

    try {
      const result = await this.groqManager.generateJson<{
        transition?: string;
        question: string;
        category: string;
      }>(prompt);

      const questionText = typeof result.question === 'string' ? result.question : '';
      const transitionText = typeof result.transition === 'string' ? result.transition : '';

      const text = transitionText
        ? `${transitionText} ${questionText}`
        : questionText;

      if (!text.trim()) {
        throw new Error('Empty question generated');
      }

      return {
        category: mapCategory(result.category),
        text,
      };
    } catch (error) {
      logger.warn('[InterviewGenerator] New topic question generation failed');
      return this.getFallbackQuestion(nextTopic, shouldClose);
    }
  }

  // ===================================================
  // FALLBACK QUESTIONS
  // ===================================================

  /**
   * Get fallback question when generation fails
   */
  getFallbackQuestion(topic: string, isClosing: boolean): QuestionItem {
    if (isClosing) {
      return {
        category: AiInterviewQuestionCategory.CLOSING,
        text: "We're coming to the end of our conversation. Is there anything else you'd like to share, or do you have any questions for me?",
      };
    }

    const questions: Record<string, string> = {
      experience: "Tell me about a project you're particularly proud of.",
      technical_skills: 'What technologies are you most experienced with?',
      problem_solving: 'Walk me through how you approach solving a complex problem.',
      teamwork: 'How do you typically collaborate with team members?',
      challenges: "What's been your biggest professional challenge?",
      career_goals: 'Where do you see yourself in the next few years?',
      system_design: 'How do you approach designing a new system or feature?',
      culture_fit: 'What kind of work environment helps you do your best work?',
      general: 'Tell me more about your relevant experience.',
    };

    return {
      category: AiInterviewQuestionCategory.BEHAVIORAL,
      text: questions[topic] || questions.general,
    };
  }

  // ===================================================
  // PRIVATE HELPERS
  // ===================================================

  private getDefaultOpeningQuestion(context: SessionContext): string {
    const companyPart = context.companyName ? ` at ${context.companyName}` : '';
    return `Hi! Thanks for joining me today. I'd love to hear about your background and what interests you about the ${context.jobTitle} role${companyPart}.`;
  }
}