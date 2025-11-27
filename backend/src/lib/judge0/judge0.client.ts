// src/lib/judge0/judge0.client.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../../utils/logger';
import {
  Judge0Submission,
  Judge0Result,
  Judge0Config,
  Judge0StatusId,
} from './judge0.types';

export class Judge0Client {
  private client: AxiosInstance;
  private useRapidAPI: boolean;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: Judge0Config = {}) {
    const rapidApiKey = config.rapidApiKey || process.env.RAPIDAPI_KEY;
    const rapidApiHost = config.rapidApiHost || process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    const rapidApiUrl = config.rapidApiUrl || process.env.RAPIDAPI_JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
    const selfHostedUrl = config.selfHostedUrl || process.env.JUDGE0_URL || 'http://localhost:2358';
    const selfHostedApiKey = config.selfHostedApiKey || process.env.JUDGE0_API_KEY;

    this.useRapidAPI = !!rapidApiKey;
    this.maxRetries = config.maxRetries || 30;
    this.retryDelay = config.retryDelay || 1000;

    const baseURL = this.useRapidAPI ? rapidApiUrl : selfHostedUrl;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (this.useRapidAPI) {
      headers['X-RapidAPI-Key'] = rapidApiKey!;
      headers['X-RapidAPI-Host'] = rapidApiHost;
    } else if (selfHostedApiKey) {
      headers['X-Auth-Token'] = selfHostedApiKey;
    }

    this.client = axios.create({
      baseURL,
      headers,
      timeout: config.timeout || 30000,
    });

    logger.info('Judge0 client initialized', { baseURL, useRapidAPI: this.useRapidAPI });
  }

  // ---------------------------------------------------
  // CONNECTION TEST
  // ---------------------------------------------------

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/about');
      logger.info('Judge0 connection successful', { version: response.data?.version });
      return true;
    } catch (error) {
      logger.error('Judge0 connection failed', { error: this.formatError(error) });
      return false;
    }
  }

  // ---------------------------------------------------
  // SINGLE SUBMISSION
  // ---------------------------------------------------

  async createSubmission(submission: Judge0Submission): Promise<string> {
    try {
      const response = await this.client.post('/submissions', submission, {
        params: { base64_encoded: false, wait: false },
      });
      return response.data.token;
    } catch (error) {
      throw this.createError('Failed to create submission', error);
    }
  }

  async getSubmission(token: string): Promise<Judge0Result> {
    try {
      const response = await this.client.get(`/submissions/${token}`, {
        params: {
          base64_encoded: false,
          fields: 'stdout,stderr,compile_output,message,status,time,memory',
        },
      });
      return response.data;
    } catch (error) {
      throw this.createError('Failed to get submission', error);
    }
  }

  async waitForResult(token: string): Promise<Judge0Result> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const result = await this.getSubmission(token);

      if (result.status.id > Judge0StatusId.PROCESSING) {
        return result;
      }

      await this.delay(this.retryDelay);
    }

    throw new Error('Submission timed out waiting for result');
  }

  // ---------------------------------------------------
  // BATCH SUBMISSION
  // ---------------------------------------------------

  async createBatchSubmission(submissions: Judge0Submission[]): Promise<string[]> {
    try {
      const response = await this.client.post(
        '/submissions/batch',
        { submissions },
        { params: { base64_encoded: false } }
      );

      const data = response.data;
      if (Array.isArray(data)) {
        return data.map((item: { token: string }) => item.token);
      }
      if (data.submissions && Array.isArray(data.submissions)) {
        return data.submissions.map((item: { token: string }) => item.token);
      }

      throw new Error('Unexpected response format from Judge0');
    } catch (error) {
      throw this.createError('Failed to create batch submission', error);
    }
  }

  async getBatchSubmission(tokens: string[]): Promise<Judge0Result[]> {
    try {
      const response = await this.client.get('/submissions/batch', {
        params: {
          tokens: tokens.join(','),
          base64_encoded: false,
          fields: 'stdout,stderr,compile_output,message,status,time,memory',
        },
      });

      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data.submissions && Array.isArray(data.submissions)) return data.submissions;

      throw new Error('Unexpected response format from Judge0');
    } catch (error) {
      throw this.createError('Failed to get batch submission', error);
    }
  }

  async waitForBatchResults(tokens: string[]): Promise<Judge0Result[]> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const results = await this.getBatchSubmission(tokens);
      const allComplete = results.every((r) => r.status.id > Judge0StatusId.PROCESSING);

      if (allComplete) return results;

      await this.delay(this.retryDelay);
    }

    throw new Error('Batch submissions timed out');
  }

  // ---------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): string {
    if (error instanceof AxiosError) {
      if (error.response) {
        return `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      }
      return error.code ? `${error.code}: ${error.message}` : error.message;
    }
    return error instanceof Error ? error.message : String(error);
  }

  private createError(message: string, error: unknown): Error {
    const errorMessage = this.formatError(error);
    logger.error(message, { error: errorMessage });

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