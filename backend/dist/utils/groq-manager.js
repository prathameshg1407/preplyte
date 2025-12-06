"use strict";
// src/utils/groq-manager.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqApiManager = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const constants_1 = require("../config/constants");
const logger_1 = require("./logger");
const errors_1 = require("./errors");
// =====================================================
// MANAGER CLASS
// =====================================================
class GroqApiManager {
    groq;
    apiKeys;
    currentKeyIndex = 0;
    maxRetries;
    requestCount = 0;
    lastRequestTime = 0;
    keyExhausted = new Set();
    keyExhaustionResetTime = 0;
    constructor(apiKeys, maxRetries = constants_1.CONSTANTS.MAX_RETRIES ?? 3) {
        this.apiKeys = apiKeys.filter(Boolean);
        this.maxRetries = maxRetries;
        if (this.apiKeys.length === 0) {
            throw new Error('No Groq API keys provided');
        }
        this.initializeClient();
    }
    // ===================================================
    // PUBLIC METHODS
    // ===================================================
    async callApi(prompt, options = {}) {
        const messages = [];
        if (options.systemPrompt) {
            messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        return this.chat({ messages, ...options });
    }
    async chat(options) {
        const { messages, temperature = constants_1.CONSTANTS.GROQ_TEMPERATURE ?? 0.7, maxTokens = constants_1.CONSTANTS.GROQ_MAX_TOKENS ?? 2048, model = constants_1.CONSTANTS.GROQ_MODEL ?? 'llama-3.1-70b-versatile', responseFormat = 'json', } = options;
        const preparedMessages = this.prepareMessages(messages, responseFormat);
        if (Date.now() - this.keyExhaustionResetTime > 60000) {
            this.keyExhausted.clear();
            this.keyExhaustionResetTime = Date.now();
        }
        let lastError = null;
        for (let keyAttempt = 0; keyAttempt < this.apiKeys.length; keyAttempt++) {
            let keyIndex = -1;
            for (let i = 0; i < this.apiKeys.length; i++) {
                const checkIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
                if (!this.keyExhausted.has(checkIndex)) {
                    keyIndex = checkIndex;
                    break;
                }
            }
            if (keyIndex === -1) {
                logger_1.logger.warn('[GroqManager] All keys exhausted, waiting...');
                await this.delay(5000);
                this.keyExhausted.clear();
                keyIndex = 0;
            }
            this.currentKeyIndex = keyIndex;
            this.initializeClient();
            for (let attempt = 0; attempt < this.maxRetries; attempt++) {
                try {
                    await this.throttle();
                    // Fixed: Use inline object instead of typed variable
                    const result = await this.groq.chat.completions.create({
                        messages: preparedMessages,
                        model,
                        temperature,
                        max_tokens: maxTokens,
                        ...(responseFormat === 'json' && {
                            response_format: { type: 'json_object' },
                        }),
                    });
                    this.requestCount++;
                    this.lastRequestTime = Date.now();
                    logger_1.logger.debug('[GroqManager] API call successful', {
                        attempt: attempt + 1,
                        keyIndex: this.currentKeyIndex,
                        model,
                    });
                    return result;
                }
                catch (error) {
                    lastError = error;
                    const errorMessage = this.getErrorMessage(error);
                    logger_1.logger.warn('[GroqManager] API call failed', {
                        attempt: attempt + 1,
                        keyIndex: this.currentKeyIndex,
                        error: errorMessage,
                    });
                    if (this.isRateLimitError(error)) {
                        this.keyExhausted.add(this.currentKeyIndex);
                        logger_1.logger.warn('[GroqManager] Rate limit, marking key exhausted', {
                            keyIndex: this.currentKeyIndex,
                        });
                        break;
                    }
                    if (this.isRetryableError(error) && attempt < this.maxRetries - 1) {
                        await this.delay(this.calculateBackoff(attempt));
                        continue;
                    }
                    if (!this.isRetryableError(error)) {
                        throw new errors_1.InternalError(`Groq API error: ${errorMessage}`);
                    }
                }
            }
        }
        throw new errors_1.InternalError(`All API attempts exhausted. Last error: ${lastError?.message || 'Unknown'}`);
    }
    async complete(prompt, options = {}) {
        const result = await this.callApi(prompt, {
            ...options,
            responseFormat: 'text',
        });
        return result.choices[0]?.message?.content || '';
    }
    async generateJson(prompt, options = {}) {
        const result = await this.callApi(prompt, {
            ...options,
            responseFormat: 'json',
        });
        const content = result.choices[0]?.message?.content || '{}';
        try {
            return JSON.parse(content);
        }
        catch (error) {
            logger_1.logger.error('[GroqManager] Failed to parse JSON response', {
                content: content.slice(0, 500),
                error: this.getErrorMessage(error),
            });
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                }
                catch {
                    // Fall through to error
                }
            }
            throw new errors_1.InternalError('Failed to parse AI response as JSON');
        }
    }
    // ===================================================
    // GETTERS
    // ===================================================
    get currentApiKeyIndex() {
        return this.currentKeyIndex;
    }
    get totalApiKeys() {
        return this.apiKeys.length;
    }
    get stats() {
        return {
            requestCount: this.requestCount,
            currentKey: this.currentKeyIndex,
            totalKeys: this.apiKeys.length,
            exhaustedKeys: this.keyExhausted.size,
        };
    }
    // ===================================================
    // PRIVATE: CLIENT MANAGEMENT
    // ===================================================
    initializeClient() {
        const apiKey = this.apiKeys[this.currentKeyIndex];
        this.groq = new groq_sdk_1.default({
            apiKey,
            timeout: constants_1.CONSTANTS.API_TIMEOUT_MS ?? 30000,
        });
    }
    // ===================================================
    // PRIVATE: MESSAGE HANDLING
    // ===================================================
    prepareMessages(messages, responseFormat) {
        const prepared = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
        if (responseFormat === 'json') {
            return this.ensureJsonInMessages(prepared);
        }
        return prepared;
    }
    ensureJsonInMessages(messages) {
        const hasJson = messages.some((msg) => msg.content.toLowerCase().includes('json'));
        if (hasJson)
            return messages;
        const systemIndex = messages.findIndex((msg) => msg.role === 'system');
        if (systemIndex >= 0) {
            const updated = [...messages];
            updated[systemIndex] = {
                ...updated[systemIndex],
                content: `${updated[systemIndex].content}\n\nRespond with valid JSON only.`,
            };
            return updated;
        }
        return [
            {
                role: 'system',
                content: 'You are a helpful assistant. Respond with valid JSON only.',
            },
            ...messages,
        ];
    }
    // ===================================================
    // PRIVATE: ERROR HANDLING
    // ===================================================
    isRateLimitError(error) {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            const errorWithStatus = error;
            return (message.includes('rate_limit') ||
                message.includes('rate limit') ||
                message.includes('429') ||
                message.includes('too many requests') ||
                errorWithStatus.status === 429);
        }
        return false;
    }
    isRetryableError(error) {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return (message.includes('timeout') ||
                message.includes('network') ||
                message.includes('econnreset') ||
                message.includes('econnrefused') ||
                message.includes('socket') ||
                message.includes('500') ||
                message.includes('502') ||
                message.includes('503') ||
                message.includes('504') ||
                message.includes('service unavailable'));
        }
        return false;
    }
    getErrorMessage(error) {
        if (error instanceof Error)
            return error.message;
        return String(error);
    }
    // ===================================================
    // PRIVATE: RATE LIMITING & BACKOFF
    // ===================================================
    async throttle() {
        const minInterval = constants_1.CONSTANTS.MIN_REQUEST_INTERVAL_MS ?? 100;
        const elapsed = Date.now() - this.lastRequestTime;
        if (elapsed < minInterval) {
            await this.delay(minInterval - elapsed);
        }
    }
    calculateBackoff(attempt) {
        const baseDelay = constants_1.CONSTANTS.RETRY_DELAY_MS ?? 1000;
        const maxDelay = 30000;
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        return Math.round(delay + jitter);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.GroqApiManager = GroqApiManager;
//# sourceMappingURL=groq-manager.js.map