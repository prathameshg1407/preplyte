"use strict";
// src/lib/judge0/judge0.client.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Judge0Client = void 0;
const axios_1 = __importStar(require("axios"));
const logger_1 = require("../../utils/logger");
const judge0_types_1 = require("./judge0.types");
class Judge0Client {
    client;
    useRapidAPI;
    maxRetries;
    retryDelay;
    constructor(config = {}) {
        const rapidApiKey = config.rapidApiKey || process.env.RAPIDAPI_KEY;
        const rapidApiHost = config.rapidApiHost || process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
        const rapidApiUrl = config.rapidApiUrl || process.env.RAPIDAPI_JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
        const selfHostedUrl = config.selfHostedUrl || process.env.JUDGE0_URL || 'http://localhost:2358';
        const selfHostedApiKey = config.selfHostedApiKey || process.env.JUDGE0_API_KEY;
        this.useRapidAPI = !!rapidApiKey;
        this.maxRetries = config.maxRetries || 30;
        this.retryDelay = config.retryDelay || 1000;
        const baseURL = this.useRapidAPI ? rapidApiUrl : selfHostedUrl;
        const headers = { 'Content-Type': 'application/json' };
        if (this.useRapidAPI) {
            headers['X-RapidAPI-Key'] = rapidApiKey;
            headers['X-RapidAPI-Host'] = rapidApiHost;
        }
        else if (selfHostedApiKey) {
            headers['X-Auth-Token'] = selfHostedApiKey;
        }
        this.client = axios_1.default.create({
            baseURL,
            headers,
            timeout: config.timeout || 30000,
        });
        logger_1.logger.info('Judge0 client initialized', { baseURL, useRapidAPI: this.useRapidAPI });
    }
    // ---------------------------------------------------
    // CONNECTION TEST
    // ---------------------------------------------------
    async testConnection() {
        try {
            const response = await this.client.get('/about');
            logger_1.logger.info('Judge0 connection successful', { version: response.data?.version });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Judge0 connection failed', { error: this.formatError(error) });
            return false;
        }
    }
    // ---------------------------------------------------
    // SINGLE SUBMISSION
    // ---------------------------------------------------
    async createSubmission(submission) {
        try {
            const response = await this.client.post('/submissions', submission, {
                params: { base64_encoded: false, wait: false },
            });
            return response.data.token;
        }
        catch (error) {
            throw this.createError('Failed to create submission', error);
        }
    }
    async getSubmission(token) {
        try {
            const response = await this.client.get(`/submissions/${token}`, {
                params: {
                    base64_encoded: false,
                    fields: 'stdout,stderr,compile_output,message,status,time,memory',
                },
            });
            return response.data;
        }
        catch (error) {
            throw this.createError('Failed to get submission', error);
        }
    }
    async waitForResult(token) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            const result = await this.getSubmission(token);
            if (result.status.id > judge0_types_1.Judge0StatusId.PROCESSING) {
                return result;
            }
            await this.delay(this.retryDelay);
        }
        throw new Error('Submission timed out waiting for result');
    }
    // ---------------------------------------------------
    // BATCH SUBMISSION
    // ---------------------------------------------------
    async createBatchSubmission(submissions) {
        try {
            const response = await this.client.post('/submissions/batch', { submissions }, { params: { base64_encoded: false } });
            const data = response.data;
            if (Array.isArray(data)) {
                return data.map((item) => item.token);
            }
            if (data.submissions && Array.isArray(data.submissions)) {
                return data.submissions.map((item) => item.token);
            }
            throw new Error('Unexpected response format from Judge0');
        }
        catch (error) {
            throw this.createError('Failed to create batch submission', error);
        }
    }
    async getBatchSubmission(tokens) {
        try {
            const response = await this.client.get('/submissions/batch', {
                params: {
                    tokens: tokens.join(','),
                    base64_encoded: false,
                    fields: 'stdout,stderr,compile_output,message,status,time,memory',
                },
            });
            const data = response.data;
            if (Array.isArray(data))
                return data;
            if (data.submissions && Array.isArray(data.submissions))
                return data.submissions;
            throw new Error('Unexpected response format from Judge0');
        }
        catch (error) {
            throw this.createError('Failed to get batch submission', error);
        }
    }
    async waitForBatchResults(tokens) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            const results = await this.getBatchSubmission(tokens);
            const allComplete = results.every((r) => r.status.id > judge0_types_1.Judge0StatusId.PROCESSING);
            if (allComplete)
                return results;
            await this.delay(this.retryDelay);
        }
        throw new Error('Batch submissions timed out');
    }
    // ---------------------------------------------------
    // UTILITIES
    // ---------------------------------------------------
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    formatError(error) {
        if (error instanceof axios_1.AxiosError) {
            if (error.response) {
                return `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
            }
            return error.code ? `${error.code}: ${error.message}` : error.message;
        }
        return error instanceof Error ? error.message : String(error);
    }
    createError(message, error) {
        const errorMessage = this.formatError(error);
        logger_1.logger.error(message, { error: errorMessage });
        if (errorMessage.includes('ECONNREFUSED')) {
            return new Error(`Judge0 server unreachable. Ensure it's running or use RapidAPI.`);
        }
        if (errorMessage.includes('401') || errorMessage.includes('403')) {
            return new Error('Judge0 authentication failed. Check your API key.');
        }
        if (errorMessage.includes('429')) {
            return new Error('Judge0 rate limit exceeded. Try again later.');
        }
        return new Error(`${message}: ${errorMessage}`);
    }
}
exports.Judge0Client = Judge0Client;
//# sourceMappingURL=judge0.client.js.map