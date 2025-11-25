// src/lib/judge0.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

class Judge0Client {
  private client: AxiosInstance;
  private useRapidAPI: boolean;

  constructor() {
    // Determine which Judge0 to use
    const rapidAPIKey = process.env.RAPIDAPI_KEY;
    const rapidAPIHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    const rapidAPIUrl = process.env.RAPIDAPI_JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
    const localUrl = process.env.JUDGE0_URL || 'http://localhost:2358';

    // Use RapidAPI if key is provided, otherwise try local
    this.useRapidAPI = !!rapidAPIKey;

    const baseURL = this.useRapidAPI ? rapidAPIUrl : localUrl;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.useRapidAPI) {
      headers['X-RapidAPI-Key'] = rapidAPIKey!;
      headers['X-RapidAPI-Host'] = rapidAPIHost;
    } else {
      // For self-hosted Judge0 with optional auth
      const authToken = process.env.JUDGE0_API_KEY;
      if (authToken) {
        headers['X-Auth-Token'] = authToken;
      }
    }

    this.client = axios.create({
      baseURL,
      headers,
      timeout: 30000,
    });

    logger.info(`Judge0 client initialized`, {
      baseURL,
      useRapidAPI: this.useRapidAPI,
    });
  }

  /**
   * Test connection to Judge0
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/about');
      logger.info('Judge0 connection successful', { version: response.data?.version });
      return true;
    } catch (error) {
      logger.error('Judge0 connection failed', this.formatError(error));
      return false;
    }
  }

  async createSubmission(submission: Judge0Submission): Promise<string> {
    try {
      const response = await this.client.post(
        '/submissions',
        {
          source_code: submission.source_code,
          language_id: submission.language_id,
          stdin: submission.stdin || '',
          expected_output: submission.expected_output,
          cpu_time_limit: submission.cpu_time_limit || 2,
          memory_limit: submission.memory_limit || 256000,
        },
        {
          params: {
            base64_encoded: false,
            wait: false,
          },
        }
      );

      return response.data.token;
    } catch (error) {
      logger.error('Judge0 submission creation failed', this.formatError(error));
      throw new Error(`Failed to create submission: ${this.formatError(error)}`);
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
      logger.error('Judge0 get submission failed', this.formatError(error));
      throw new Error(`Failed to get submission result: ${this.formatError(error)}`);
    }
  }

  async createBatchSubmission(submissions: Judge0Submission[]): Promise<string[]> {
    try {
      const response = await this.client.post(
        '/submissions/batch',
        {
          submissions: submissions.map((sub) => ({
            source_code: sub.source_code,
            language_id: sub.language_id,
            stdin: sub.stdin || '',
            expected_output: sub.expected_output,
            cpu_time_limit: sub.cpu_time_limit || 2,
            memory_limit: sub.memory_limit || 256000,
          })),
        },
        {
          params: {
            base64_encoded: false,
          },
        }
      );

      // Handle different response formats
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.map((item: { token: string }) => item.token);
      } else if (data.submissions && Array.isArray(data.submissions)) {
        return data.submissions.map((item: { token: string }) => item.token);
      } else {
        logger.error('Unexpected Judge0 batch response format', { data });
        throw new Error('Unexpected response format from Judge0');
      }
    } catch (error) {
      const errorMessage = this.formatError(error);
      logger.error('Judge0 batch submission creation failed', { error: errorMessage });
      
      // Provide helpful error messages
      if (errorMessage.includes('ECONNREFUSED')) {
        throw new Error(
          `Judge0 server is not reachable at ${this.client.defaults.baseURL}. ` +
          'Please ensure Judge0 is running or use RapidAPI.'
        );
      }
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new Error('Judge0 authentication failed. Check your API key.');
      }
      if (errorMessage.includes('429')) {
        throw new Error('Judge0 rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Failed to create batch submission: ${errorMessage}`);
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

      // Handle different response formats
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data;
      } else if (data.submissions && Array.isArray(data.submissions)) {
        return data.submissions;
      } else {
        logger.error('Unexpected Judge0 batch response format', { data });
        throw new Error('Unexpected response format from Judge0');
      }
    } catch (error) {
      logger.error('Judge0 get batch submission failed', this.formatError(error));
      throw new Error(`Failed to get batch submission results: ${this.formatError(error)}`);
    }
  }

  async waitForResult(token: string, maxAttempts: number = 30): Promise<Judge0Result> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getSubmission(token);

      // Status IDs: 1 = In Queue, 2 = Processing
      if (result.status.id > 2) {
        return result;
      }

      // Wait longer for RapidAPI (rate limits)
      const delay = this.useRapidAPI ? 1000 : 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('Submission timed out waiting for result');
  }

  async waitForBatchResults(
    tokens: string[],
    maxAttempts: number = 30
  ): Promise<Judge0Result[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const results = await this.getBatchSubmission(tokens);

      // Check if all submissions are complete (status > 2)
      const allComplete = results.every((r) => r.status.id > 2);

      if (allComplete) {
        return results;
      }

      // Wait longer for RapidAPI (rate limits)
      const delay = this.useRapidAPI ? 1000 : 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('Batch submissions timed out waiting for results');
  }

  mapStatusToSubmissionStatus(statusId: number): string {
    const statusMap: Record<number, string> = {
      1: 'PENDING',
      2: 'PENDING',
      3: 'ACCEPTED',
      4: 'WRONG_ANSWER',
      5: 'TIME_LIMIT_EXCEEDED',
      6: 'COMPILATION_ERROR',
      7: 'RUNTIME_ERROR',
      8: 'RUNTIME_ERROR',
      9: 'RUNTIME_ERROR',
      10: 'RUNTIME_ERROR',
      11: 'RUNTIME_ERROR',
      12: 'RUNTIME_ERROR',
      13: 'MEMORY_LIMIT_EXCEEDED',
      14: 'WRONG_ANSWER',
    };

    return statusMap[statusId] || 'RUNTIME_ERROR';
  }

  private formatError(error: unknown): string {
    if (error instanceof AxiosError) {
      if (error.response) {
        return `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      }
      if (error.code) {
        return `${error.code}: ${error.message}`;
      }
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

export const judge0 = new Judge0Client();
export default judge0;