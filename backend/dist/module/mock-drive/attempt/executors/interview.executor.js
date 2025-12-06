"use strict";
// src/module/mock-drive/attempt/executors/interview.executor.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewModuleExecutor = void 0;
const nanoid_1 = require("nanoid");
const base_executor_1 = require("./base.executor");
const errors_1 = require("../../../../utils/errors");
const logger_1 = require("../../../../utils/logger");
// Import services from practice interview module
const services_1 = require("../../../practice/interview/services");
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
];
const PASSING_SCORE = 60;
// ============================================
// Type Guards
// ============================================
function isRespondPayload(payload) {
    if (typeof payload !== 'object' || payload === null)
        return false;
    return typeof payload.answer === 'string';
}
function isSkipPayload(payload) {
    return typeof payload === 'object' && payload !== null;
}
function isAudioChunkPayload(payload) {
    if (typeof payload !== 'object' || payload === null)
        return false;
    return typeof payload.chunk === 'string';
}
function isInterviewAction(action) {
    return VALID_ACTIONS.includes(action);
}
function hasInterviewStructure(data) {
    if (data === null || typeof data !== 'object')
        return false;
    const d = data;
    return ('config' in d &&
        'conversation' in d &&
        'responses' in d &&
        Array.isArray(d.conversation) &&
        Array.isArray(d.responses));
}
// ============================================
// Type Adapters
// ============================================
function toPracticeMessage(msg) {
    return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        metadata: undefined,
    };
}
// src/module/mock-drive/attempt/executors/interview.executor.ts (continued)
function toMockDriveScores(scores) {
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
class InterviewModuleExecutor extends base_executor_1.BaseModuleExecutor {
    runtimeContexts = new Map();
    constructor(prisma) {
        super(prisma, 'AI_INTERVIEW');
    }
    async initialize(context) {
        this.validateContext(context);
        const config = context.config;
        logger_1.logger.info('[MockDrive:Interview] Initializing interview module', {
            userId: context.userId,
            jobTitle: config.jobTitle,
            difficulty: config.difficulty,
        });
        // Get user's default resume
        const resume = await this.getDefaultResume(context.userId);
        if (!resume) {
            throw new errors_1.NotFoundError('Resume. Please upload a resume first');
        }
        // Parse resume
        const parsedResume = await this.parseResume(context.userId, resume);
        // Initialize conversation context
        const conversationContext = await services_1.conversationEngineService.initializeContext(parsedResume, {
            jobTitle: config.jobTitle,
            companyName: config.companyName || null,
            difficulty: config.difficulty,
            focusAreas: config.focusAreas || [],
            targetQuestions: config.targetQuestions,
        });
        // Generate opening
        const opening = await services_1.conversationEngineService.generateOpening(conversationContext);
        // Cache runtime context
        this.runtimeContexts.set(context.moduleAttemptId, {
            conversationContext,
            parsedResume,
        });
        const initialMessage = {
            id: (0, nanoid_1.nanoid)(),
            role: 'assistant',
            content: opening.question,
            timestamp: new Date().toISOString(),
        };
        const interviewConfig = {
            resumeId: resume.id,
            resumeUrl: resume.fileUrl,
            jobTitle: config.jobTitle,
            companyName: config.companyName || null,
            difficulty: config.difficulty,
            focusAreas: config.focusAreas || [],
            targetQuestions: config.targetQuestions,
        };
        const data = {
            config: interviewConfig,
            conversation: [initialMessage],
            responses: [],
            isVoiceEnabled: false,
        };
        logger_1.logger.info('[MockDrive:Interview] Interview initialized successfully');
        return { data };
    }
    async handleAction(context, action, payload) {
        if (!isInterviewAction(action)) {
            throw new errors_1.BadRequestError(`Unknown action: ${action}`);
        }
        if (!hasInterviewStructure(context.existingData)) {
            throw new errors_1.BadRequestError('Module not properly initialized');
        }
        const data = context.existingData;
        const runtimeContext = await this.getOrRebuildRuntimeContext(context, data);
        logger_1.logger.debug('[MockDrive:Interview] Handling action', { action });
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
    async finalize(context) {
        if (!hasInterviewStructure(context.existingData)) {
            throw new errors_1.BadRequestError('Module data not found');
        }
        const data = context.existingData;
        const config = context.config;
        logger_1.logger.info('[MockDrive:Interview] Finalizing interview', {
            responseCount: data.responses.length,
            targetQuestions: config.targetQuestions,
        });
        // Calculate scores
        const categoryScores = this.calculateCategoryScores(data.responses);
        const { overallScore, answeredCount } = this.calculateOverallScore(data.responses);
        // Generate feedback
        const feedback = this.generateFeedbackSummary(data, config, overallScore);
        // Build summary
        const summary = {
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
        const finalData = {
            config: data.config,
            conversation: finalConversation,
            responses: data.responses,
            summary,
        };
        // Cleanup runtime context
        this.runtimeContexts.delete(context.moduleAttemptId);
        logger_1.logger.info('[MockDrive:Interview] Interview finalized', {
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
    async handleRespond(context, data, runtimeContext, payload) {
        if (!isRespondPayload(payload)) {
            throw new errors_1.BadRequestError('Invalid respond payload: answer is required');
        }
        const config = context.config;
        let answer = payload.answer;
        // Transcribe audio if provided
        if (payload.audioBuffer) {
            answer = await this.transcribeAudio(payload.audioBuffer);
        }
        // Get current question
        const lastQuestion = this.getLastAssistantMessage(data.conversation);
        if (!lastQuestion) {
            throw new errors_1.BadRequestError('No question to answer');
        }
        // Add user message
        const userMessage = this.createMessage('user', answer);
        // Determine question category
        const category = this.inferCategory(data.responses.length, config.targetQuestions);
        // Score response
        const scoringResult = await services_1.conversationEngineService.scoreResponse(lastQuestion.content, answer, category, runtimeContext.conversationContext);
        // Create response record
        const response = {
            id: (0, nanoid_1.nanoid)(),
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
        };
    }
    async handleSkip(context, data, runtimeContext, payload) {
        if (!isSkipPayload(payload)) {
            throw new errors_1.BadRequestError('Invalid skip payload');
        }
        const config = context.config;
        const lastQuestion = this.getLastAssistantMessage(data.conversation);
        if (!lastQuestion) {
            throw new errors_1.BadRequestError('No question to skip');
        }
        const category = this.inferCategory(data.responses.length, config.targetQuestions);
        // Create skipped response
        const response = {
            id: (0, nanoid_1.nanoid)(),
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
        };
    }
    handleStartVoice() {
        return { isVoiceEnabled: true };
    }
    async handleAudioChunk(data, payload) {
        if (!isAudioChunkPayload(payload)) {
            throw new errors_1.BadRequestError('Invalid audio chunk payload');
        }
        const transcription = await this.transcribeAudio(payload.chunk);
        const currentTranscription = data.pendingTranscription || '';
        return {
            pendingTranscription: `${currentTranscription} ${transcription}`.trim(),
        };
    }
    async handleGetAudioQuestion(data) {
        const lastQuestion = this.getLastAssistantMessage(data.conversation);
        if (!lastQuestion) {
            throw new errors_1.BadRequestError('No question available');
        }
        try {
            const ttsResult = await services_1.textToSpeechService.synthesize({
                text: lastQuestion.content,
            });
            return {
                pendingTranscription: `AUDIO:${ttsResult.audioBuffer.toString('base64')}`,
            };
        }
        catch (error) {
            logger_1.logger.error('[MockDrive:Interview] TTS generation failed', error);
            throw new errors_1.BadRequestError('Failed to generate audio question');
        }
    }
    handleEndEarly(data) {
        const closingMessage = this.createMessage('assistant', 'Thank you for participating in this interview. Your session has been concluded early.');
        return {
            conversation: [...data.conversation, closingMessage],
        };
    }
    // ============================================
    // Helper Methods - Resume
    // ============================================
    async getDefaultResume(userId) {
        return this.prisma.resume.findFirst({
            where: { userId, isDefault: true },
        });
    }
    async parseResume(userId, resume) {
        try {
            return await services_1.resumeParserService.parseResumeById(userId, resume.id);
        }
        catch (error) {
            logger_1.logger.error('[MockDrive:Interview] Resume parsing failed', error);
            return this.createMinimalResume(resume);
        }
    }
    createMinimalResume(resume) {
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
    async getOrRebuildRuntimeContext(context, data) {
        const cached = this.runtimeContexts.get(context.moduleAttemptId);
        if (cached) {
            return cached;
        }
        // Rebuild from stored data
        const resume = { id: data.config.resumeId, fileUrl: data.config.resumeUrl };
        const parsedResume = await this.parseResume(context.userId, resume);
        const conversationContext = await services_1.conversationEngineService.initializeContext(parsedResume, {
            jobTitle: data.config.jobTitle,
            companyName: data.config.companyName,
            difficulty: data.config.difficulty,
            focusAreas: data.config.focusAreas,
            targetQuestions: data.config.targetQuestions,
        });
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
        const runtimeContext = { conversationContext, parsedResume };
        this.runtimeContexts.set(context.moduleAttemptId, runtimeContext);
        return runtimeContext;
    }
    // ============================================
    // Helper Methods - Conversation
    // ============================================
    createMessage(role, content) {
        return {
            id: (0, nanoid_1.nanoid)(),
            role,
            content,
            timestamp: new Date().toISOString(),
        };
    }
    getLastAssistantMessage(conversation) {
        return [...conversation].reverse().find((m) => m.role === 'assistant');
    }
    async generateNextQuestion(runtimeContext, previousAnswer) {
        const result = await services_1.conversationEngineService.generateNextQuestion(runtimeContext.conversationContext, previousAnswer);
        return this.createMessage('assistant', result.question);
    }
    addClosingMessage(conversation) {
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
    async transcribeAudio(base64Audio) {
        try {
            const audioBuffer = Buffer.from(base64Audio, 'base64');
            const transcription = await services_1.speechToTextService.transcribeBuffer(audioBuffer);
            return transcription.text;
        }
        catch (error) {
            logger_1.logger.error('[MockDrive:Interview] Audio transcription failed', error);
            throw new errors_1.BadRequestError('Failed to transcribe audio response');
        }
    }
    // ============================================
    // Helper Methods - Scoring
    // ============================================
    createZeroScores() {
        return {
            relevance: 0,
            clarity: 0,
            depth: 0,
            technicalAccuracy: null,
            overall: 0,
        };
    }
    calculateOverallScore(responses) {
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
    calculateCategoryScores(responses) {
        const scores = {
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
        for (const category of Object.keys(scores)) {
            if (scores[category].count > 0) {
                scores[category].score = Math.round((scores[category].score / scores[category].count) * 10) / 10;
            }
        }
        return scores;
    }
    inferCategory(questionIndex, totalQuestions) {
        const ratio = questionIndex / totalQuestions;
        if (ratio < 0.15)
            return 'INTRODUCTORY';
        if (ratio < 0.5)
            return 'TECHNICAL';
        if (ratio < 0.75)
            return 'BEHAVIORAL';
        if (ratio < 0.9)
            return 'SITUATIONAL';
        return 'CLOSING';
    }
    // ============================================
    // Helper Methods - Feedback
    // ============================================
    generateFeedbackSummary(data, config, overallScore) {
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
    calculateAverageScoresByDimension(responses) {
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
    identifyStrengths(scores) {
        const strengths = [];
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
    identifyImprovements(scores) {
        const improvements = [];
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
    generateSummaryText(jobTitle, overallScore) {
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
exports.InterviewModuleExecutor = InterviewModuleExecutor;
//# sourceMappingURL=interview.executor.js.map