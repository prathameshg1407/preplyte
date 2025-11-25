// src/modules/practice/machine/judge0.service.ts

import axios, { AxiosInstance } from 'axios';
import {
  Judge0Submission,
  Judge0SubmissionResponse,
  Judge0Result,
  Judge0StatusId,
  SUPPORTED_LANGUAGES,
  CodeExecutionRequest,
  CodeExecutionResult,
  TestCaseExecutionResult,
  BatchExecutionResult,
  mapJudge0StatusToSubmissionStatus,
} from './judge0.types';

// =====================================================
// CONFIGURATION
// =====================================================

interface Judge0Config {
  apiKey: string;
  apiHost: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

const defaultConfig: Judge0Config = {
  apiKey: process.env.RAPIDAPI_KEY || '',
  apiHost: process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
  baseUrl: process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com',
  timeout: 30000,
  maxRetries: 10,
  retryDelay: 1000,
};

// =====================================================
// JUDGE0 SERVICE CLASS
// =====================================================

export class Judge0Service {
  private client: AxiosInstance;
  private config: Judge0Config;

  constructor(config: Partial<Judge0Config> = {}) {
    this.config = { ...defaultConfig, ...config };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.config.apiKey,
        'X-RapidAPI-Host': this.config.apiHost,
      },
    });
  }

  // ---------------------------------------------------
  // GET LANGUAGE ID
  // ---------------------------------------------------

  getLanguageId(language: string): number {
    const normalizedLang = language.toLowerCase().trim();
    const langConfig = SUPPORTED_LANGUAGES[normalizedLang];

    if (!langConfig) {
      throw new Error(
        `Unsupported language: ${language}. Supported languages: ${Object.keys(
          SUPPORTED_LANGUAGES
        ).join(', ')}`
      );
    }

    return langConfig.id;
  }

  // ---------------------------------------------------
  // GET SUPPORTED LANGUAGES
  // ---------------------------------------------------

  getSupportedLanguages(): { key: string; id: number; name: string; monacoId: string }[] {
    const monacoMap: Record<string, string> = {
      python: 'python',
      javascript: 'javascript',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'csharp',
      go: 'go',
      rust: 'rust',
      ruby: 'ruby',
      swift: 'swift',
      kotlin: 'kotlin',
      typescript: 'typescript',
      php: 'php',
      scala: 'scala',
      r: 'r',
    };

    // Filter to unique languages (avoid duplicates like python/python3)
    const uniqueLanguages = new Map<number, { key: string; id: number; name: string; monacoId: string }>();
    
    Object.entries(SUPPORTED_LANGUAGES).forEach(([key, value]) => {
      if (!uniqueLanguages.has(value.id)) {
        uniqueLanguages.set(value.id, {
          key,
          id: value.id,
          name: value.name,
          monacoId: monacoMap[key] || key,
        });
      }
    });

    return Array.from(uniqueLanguages.values());
  }

  // ---------------------------------------------------
  // SUBMIT CODE
  // ---------------------------------------------------

  async submitCode(submission: Judge0Submission): Promise<string> {
    try {
      const response = await this.client.post<Judge0SubmissionResponse>(
        '/submissions',
        submission,
        {
          params: {
            base64_encoded: 'false',
            wait: 'false',
          },
        }
      );

      return response.data.token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to submit code: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  // ---------------------------------------------------
  // GET SUBMISSION RESULT
  // ---------------------------------------------------

  async getSubmissionResult(token: string): Promise<Judge0Result> {
    try {
      const response = await this.client.get<Judge0Result>(
        `/submissions/${token}`,
        {
          params: {
            base64_encoded: 'false',
            fields: '*',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get submission result: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  // ---------------------------------------------------
  // WAIT FOR RESULT (POLLING)
  // ---------------------------------------------------

  async waitForResult(token: string): Promise<Judge0Result> {
    let retries = 0;

    while (retries < this.config.maxRetries) {
      const result = await this.getSubmissionResult(token);

      if (
        result.status.id !== Judge0StatusId.IN_QUEUE &&
        result.status.id !== Judge0StatusId.PROCESSING
      ) {
        return result;
      }

      await this.delay(this.config.retryDelay);
      retries++;
    }

    throw new Error('Timeout waiting for code execution result');
  }

  // ---------------------------------------------------
  // EXECUTE CODE
  // ---------------------------------------------------

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const languageId = this.getLanguageId(request.language);

    const submission: Judge0Submission = {
      source_code: request.code,
      language_id: languageId,
      stdin: request.stdin || '',
      expected_output: request.expectedOutput,
      cpu_time_limit: request.timeLimit || 5,
      memory_limit: request.memoryLimit || 128000,
    };

    try {
      const token = await this.submitCode(submission);
      const result = await this.waitForResult(token);

      return this.parseResult(result, request.expectedOutput);
    } catch (error) {
      return {
        success: false,
        status: 'ERROR',
        statusId: -1,
        stdout: null,
        stderr: null,
        compileOutput: null,
        executionTime: '0',
        memoryUsed: 0,
        isCorrect: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ---------------------------------------------------
  // EXECUTE WITH TEST CASE
  // ---------------------------------------------------

  async executeWithTestCase(
    code: string,
    language: string,
    testCaseId: string,
    input: string,
    expectedOutput: string,
    timeLimit?: number
  ): Promise<TestCaseExecutionResult> {
    const result = await this.executeCode({
      code,
      language,
      stdin: input,
      expectedOutput,
      timeLimit,
    });

    const actualOutput = result.stdout?.trim() || '';
    const expected = expectedOutput.trim();
    const isCorrect = result.statusId === Judge0StatusId.ACCEPTED || 
                      this.compareOutputs(actualOutput, expected);

    return {
      testCaseId,
      input,
      expectedOutput: expected,
      actualOutput,
      isCorrect,
      status: result.status,
      statusId: result.statusId,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      error: result.stderr || result.compileOutput || result.error || undefined,
    };
  }

  // ---------------------------------------------------
  // BATCH EXECUTE TEST CASES
  // ---------------------------------------------------

  async executeBatch(
    code: string,
    language: string,
    questionId: string,
    testCases: { id: string; input: string; expectedOutput: string }[],
    timeLimit?: number
  ): Promise<BatchExecutionResult> {
    const results: TestCaseExecutionResult[] = [];
    let passedCount = 0;
    let failedCount = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let hasError = false;

    for (const testCase of testCases) {
      const result = await this.executeWithTestCase(
        code,
        language,
        testCase.id,
        testCase.input,
        testCase.expectedOutput,
        timeLimit
      );

      results.push(result);

      if (result.isCorrect) {
        passedCount++;
      } else {
        failedCount++;
      }

      if (result.error) {
        hasError = true;
      }

      totalTime += parseFloat(result.executionTime) || 0;
      totalMemory += result.memoryUsed || 0;
    }

    let overallStatus: BatchExecutionResult['overallStatus'];
    if (passedCount === testCases.length) {
      overallStatus = 'PASSED';
    } else if (passedCount > 0) {
      overallStatus = 'PARTIALLY_PASSED';
    } else if (hasError) {
      overallStatus = 'ERROR';
    } else {
      overallStatus = 'FAILED';
    }

    return {
      questionId,
      totalTestCases: testCases.length,
      passedTestCases: passedCount,
      failedTestCases: failedCount,
      results,
      overallStatus,
      totalExecutionTime: totalTime,
      averageMemory: testCases.length > 0 ? totalMemory / testCases.length : 0,
    };
  }

  // ---------------------------------------------------
  // UTILITY METHODS
  // ---------------------------------------------------

  private parseResult(
    result: Judge0Result,
    expectedOutput?: string
  ): CodeExecutionResult {
    const isAccepted = result.status.id === Judge0StatusId.ACCEPTED;
    const actualOutput = result.stdout?.trim() || '';
    const expected = expectedOutput?.trim() || '';

    return {
      success: isAccepted || (expectedOutput ? this.compareOutputs(actualOutput, expected) : true),
      status: result.status.description,
      statusId: result.status.id,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      executionTime: result.time || '0',
      memoryUsed: result.memory || 0,
      isCorrect: isAccepted || this.compareOutputs(actualOutput, expected),
    };
  }

  private compareOutputs(actual: string, expected: string): boolean {
    const normalizeOutput = (output: string): string => {
      return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
    };

    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ---------------------------------------------------
  // RUN CODE (SIMPLE EXECUTION WITHOUT TEST CASE)
  // ---------------------------------------------------

  async runCode(
    code: string,
    language: string,
    stdin?: string
  ): Promise<CodeExecutionResult> {
    return this.executeCode({
      code,
      language,
      stdin,
    });
  }

  // ---------------------------------------------------
  // MAP STATUS TO SUBMISSION STATUS
  // ---------------------------------------------------

  mapStatusToSubmissionStatus(statusId: number) {
    return mapJudge0StatusToSubmissionStatus(statusId);
  }
}

// Export singleton instance
export const judge0Service = new Judge0Service();