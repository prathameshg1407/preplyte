"use strict";
// src/module/practice/interview/services/conversation-engine.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationEngineService = exports.conversationEngineService = void 0;
const nanoid_1 = require("nanoid");
const groq_manager_1 = require("../../../../utils/groq-manager");
const logger_1 = require("../../../../utils/logger");
const interview_prompts_1 = require("../interview.prompts");
const interview_constants_1 = require("../interview.constants");
const resume_parser_service_1 = require("./resume-parser.service");
// =====================================================
// SERVICE CLASS
// =====================================================
class ConversationEngineService {
    groq;
    constructor() {
        const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
            .split(',')
            .filter(Boolean);
        this.groq = new groq_manager_1.GroqApiManager(apiKeys);
    }
    // ===================================================
    // PUBLIC METHODS
    // ===================================================
    /**
     * Initialize a new conversation context
     */
    async initializeContext(resume, config) {
        const candidateProfile = resume_parser_service_1.resumeParserService.extractCandidateProfile(resume.structured);
        return {
            resume,
            config: {
                resumeId: null,
                ...config,
            },
            history: [],
            questionsAsked: [],
            currentTopic: null,
            followUpDepth: 0,
            candidateProfile,
        };
    }
    /**
     * Generate the opening message/question
     */
    async generateOpening(context) {
        logger_1.logger.debug('[ConversationEngine] Generating opening');
        const systemPrompt = (0, interview_prompts_1.buildInterviewerSystemPrompt)(context.resume.structured, context.candidateProfile, context.config.difficulty, context.config.jobTitle, context.config.companyName, context.config.focusAreas);
        const openingPrompt = (0, interview_prompts_1.buildOpeningPrompt)(context.candidateProfile.name, context.config.jobTitle);
        const response = await this.groq.complete(openingPrompt, {
            systemPrompt,
            temperature: interview_constants_1.AI_CONFIG.LLM_TEMPERATURE,
            maxTokens: interview_constants_1.AI_CONFIG.LLM_MAX_TOKENS,
        });
        return {
            question: response.trim(),
            category: 'INTRODUCTORY',
            isFollowUp: false,
        };
    }
    /**
     * Generate the next question based on conversation context
     */
    async generateNextQuestion(context, candidateResponse) {
        logger_1.logger.debug('[ConversationEngine] Generating next question', {
            historyLength: context.history.length,
            questionsAsked: context.questionsAsked.length,
            followUpDepth: context.followUpDepth,
        });
        // Add candidate response to history if provided
        if (candidateResponse) {
            context.history.push({
                id: (0, nanoid_1.nanoid)(),
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
        const systemPrompt = (0, interview_prompts_1.buildInterviewerSystemPrompt)(context.resume.structured, context.candidateProfile, context.config.difficulty, context.config.jobTitle, context.config.companyName, context.config.focusAreas);
        const conversationContextPrompt = (0, interview_prompts_1.buildConversationContext)(context.history, context.questionsAsked.map(q => q.question), context.currentTopic, context.followUpDepth);
        let userPrompt;
        if (shouldFollowUp && candidateResponse) {
            const lastQuestion = context.questionsAsked[context.questionsAsked.length - 1];
            userPrompt = (0, interview_prompts_1.buildFollowUpPrompt)(lastQuestion?.question || '', candidateResponse, nextCategory);
        }
        else {
            userPrompt = `${conversationContextPrompt}\n\nGenerate the next ${nextCategory} question based on the candidate's profile and conversation so far.`;
        }
        const response = await this.groq.complete(userPrompt, {
            systemPrompt: `${systemPrompt}\n\n${conversationContextPrompt}`,
            temperature: interview_constants_1.AI_CONFIG.LLM_TEMPERATURE,
            maxTokens: interview_constants_1.AI_CONFIG.LLM_MAX_TOKENS,
        });
        const question = response.trim();
        // Update context
        const generatedQuestion = {
            id: (0, nanoid_1.nanoid)(),
            category: nextCategory,
            question,
            order: context.questionsAsked.length + 1,
            followUpPotential: [],
        };
        context.questionsAsked.push(generatedQuestion);
        context.history.push({
            id: (0, nanoid_1.nanoid)(),
            role: 'assistant',
            content: question,
            timestamp: new Date(),
        });
        if (shouldFollowUp) {
            context.followUpDepth++;
        }
        else {
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
    async scoreResponse(question, answer, category, context) {
        logger_1.logger.debug('[ConversationEngine] Scoring response');
        const expectedTopics = this.getExpectedTopics(context, category);
        const prompt = (0, interview_prompts_1.buildScoringPrompt)(question, answer, category, context.config.difficulty, expectedTopics);
        try {
            const result = await this.groq.generateJson(prompt, {
                temperature: interview_constants_1.AI_CONFIG.FEEDBACK_TEMPERATURE,
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
        }
        catch (error) {
            logger_1.logger.error('[ConversationEngine] Scoring failed', error);
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
    async generateTopicTransition(context, nextCategory) {
        const prompt = (0, interview_prompts_1.buildTopicTransitionPrompt)(context.currentTopic || 'introduction', nextCategory, context.candidateProfile.primarySkills);
        const systemPrompt = (0, interview_prompts_1.buildInterviewerSystemPrompt)(context.resume.structured, context.candidateProfile, context.config.difficulty, context.config.jobTitle, context.config.companyName, context.config.focusAreas);
        return this.groq.complete(prompt, {
            systemPrompt,
            temperature: interview_constants_1.AI_CONFIG.LLM_TEMPERATURE,
            maxTokens: interview_constants_1.AI_CONFIG.LLM_MAX_TOKENS,
        });
    }
    /**
     * Check if interview should end
     */
    shouldEndInterview(context) {
        return (context.questionsAsked.length >= context.config.targetQuestions ||
            this.hasCompletedAllCategories(context));
    }
    /**
     * Get current question state
     */
    getCurrentQuestionState(context) {
        const lastQuestion = context.questionsAsked[context.questionsAsked.length - 1];
        if (!lastQuestion)
            return null;
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
    shouldAskFollowUp(context) {
        if (context.followUpDepth >= interview_constants_1.INTERVIEW_SESSION_CONFIG.MAX_FOLLOWUP_DEPTH) {
            return false;
        }
        if (context.questionsAsked.length === 0) {
            return false;
        }
        // Check if we have enough questions in the current category
        const lastCategory = context.questionsAsked[context.questionsAsked.length - 1]?.category;
        const categoryConfig = interview_constants_1.QUESTION_CATEGORIES[lastCategory];
        const categoryCount = context.questionsAsked.filter(q => q.category === lastCategory).length;
        if (categoryCount >= (categoryConfig?.maxCount || 3)) {
            return false;
        }
        // 50% chance of follow-up based on difficulty
        const difficultyConfig = interview_constants_1.DIFFICULTY_CONFIG[context.config.difficulty];
        const followUpChance = difficultyConfig.followUpIntensity === 'high' ? 0.7 :
            difficultyConfig.followUpIntensity === 'medium' ? 0.5 : 0.3;
        return Math.random() < followUpChance;
    }
    determineNextCategory(context) {
        const categoryCounts = {
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
        const priorities = [
            'TECHNICAL',
            'BEHAVIORAL',
            'SITUATIONAL',
            'CLOSING',
        ];
        for (const category of priorities) {
            const config = interview_constants_1.QUESTION_CATEGORIES[category];
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
        const weights = [
            ['TECHNICAL', interview_constants_1.QUESTION_CATEGORIES.TECHNICAL.weight],
            ['BEHAVIORAL', interview_constants_1.QUESTION_CATEGORIES.BEHAVIORAL.weight],
            ['SITUATIONAL', interview_constants_1.QUESTION_CATEGORIES.SITUATIONAL.weight],
        ];
        const totalWeight = weights.reduce((sum, [_, w]) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (const [category, weight] of weights) {
            random -= weight;
            if (random <= 0) {
                const config = interview_constants_1.QUESTION_CATEGORIES[category];
                if (categoryCounts[category] < config.maxCount) {
                    return category;
                }
            }
        }
        return 'TECHNICAL';
    }
    shouldCloseInterview(context) {
        const remaining = context.config.targetQuestions - context.questionsAsked.length;
        return remaining <= 1 && !context.questionsAsked.some(q => q.category === 'CLOSING');
    }
    hasCompletedAllCategories(context) {
        const categories = [
            'INTRODUCTORY',
            'TECHNICAL',
            'BEHAVIORAL',
        ];
        return categories.every(category => {
            const count = context.questionsAsked.filter(q => q.category === category).length;
            return count >= interview_constants_1.QUESTION_CATEGORIES[category].minCount;
        });
    }
    async generateClosingQuestion(context) {
        const prompt = (0, interview_prompts_1.buildClosingPrompt)(context.candidateProfile.name);
        const response = await this.groq.complete(prompt, {
            temperature: 0.5,
            maxTokens: 300,
        });
        const question = response.trim();
        context.questionsAsked.push({
            id: (0, nanoid_1.nanoid)(),
            category: 'CLOSING',
            question,
            order: context.questionsAsked.length + 1,
            followUpPotential: [],
        });
        context.history.push({
            id: (0, nanoid_1.nanoid)(),
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
    getExpectedTopics(context, category) {
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
    validateScores(scores) {
        const clamp = (value, min, max) => {
            if (value === undefined || value === null)
                return Math.round((min + max) / 2);
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
exports.ConversationEngineService = ConversationEngineService;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.conversationEngineService = new ConversationEngineService();
//# sourceMappingURL=conversation-engine.service.js.map