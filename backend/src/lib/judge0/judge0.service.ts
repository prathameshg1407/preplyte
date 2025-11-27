// src/lib/judge0/judge0.service.ts

import { Judge0Client } from './judge0.client';
import {
  Judge0Submission,
  Judge0Result,
  Judge0Config,
  Judge0StatusId,
  CodeExecutionRequest,
  CodeExecutionResult,
  TestCaseExecutionResult,
  BatchExecutionResult,
  mapJudge0StatusToSubmissionStatus,
} from './judge0.types';
import { getLanguageId, getSupportedLanguages } from './judge0.languages';

export class Judge0Service {
  private client: Judge0Client;

  constructor(config: Judge0Config = {}) {
    this.client = new Judge0Client(config);
  }

  // ---------------------------------------------------
  // DELEGATED METHODS (from Judge0Client)
  // ---------------------------------------------------

  testConnection = () => this.client.testConnection();
  
  /** Create a single submission and get token */
  createSubmission = (submission: Judge0Submission) => 
    this.client.createSubmission(submission);
  
  /** Get submission result by token */
  getSubmission = (token: string) => 
    this.client.getSubmission(token);
  
  /** Wait for a single submission result */
  waitForResult = (token: string) => 
    this.client.waitForResult(token);
  
  /** Create batch submissions and get tokens */
  createBatchSubmission = (submissions: Judge0Submission[]) => 
    this.client.createBatchSubmission(submissions);
  
  /** Get batch submission results by tokens */
  getBatchSubmission = (tokens: string[]) => 
    this.client.getBatchSubmission(tokens);
  
  /** Wait for all batch results */
  waitForBatchResults = (tokens: string[]) => 
    this.client.waitForBatchResults(tokens);

  // ---------------------------------------------------
  // STATIC HELPERS
  // ---------------------------------------------------

  getLanguageId = getLanguageId;
  getSupportedLanguages = getSupportedLanguages;
  mapStatusToSubmissionStatus = mapJudge0StatusToSubmissionStatus;

  // ---------------------------------------------------
  // CODE EXECUTION (High-level)
  // ---------------------------------------------------

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const languageId = getLanguageId(request.language);

    const submission: Judge0Submission = {
      source_code: request.code,
      language_id: languageId,
      stdin: request.stdin || '',
      expected_output: request.expectedOutput,
      cpu_time_limit: request.timeLimit || 5,
      memory_limit: request.memoryLimit || 128000,
    };

    try {
      const token = await this.client.createSubmission(submission);
      const result = await this.client.waitForResult(token);
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

  async runCode(code: string, language: string, stdin?: string): Promise<CodeExecutionResult> {
    return this.executeCode({ code, language, stdin });
  }

  // ---------------------------------------------------
  // TEST CASE EXECUTION
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
    const isCorrect =
      result.statusId === Judge0StatusId.ACCEPTED ||
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
  // BATCH EXECUTION
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
    let hasError = false;
    let totalTime = 0;
    let totalMemory = 0;

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
      if (result.isCorrect) passedCount++;
      if (result.error) hasError = true;
      totalTime += parseFloat(result.executionTime) || 0;
      totalMemory += result.memoryUsed || 0;
    }

    const failedCount = testCases.length - passedCount;
    let overallStatus: BatchExecutionResult['overallStatus'];

    if (passedCount === testCases.length) overallStatus = 'PASSED';
    else if (passedCount > 0) overallStatus = 'PARTIALLY_PASSED';
    else if (hasError) overallStatus = 'ERROR';
    else overallStatus = 'FAILED';

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
  // UTILITIES
  // ---------------------------------------------------

  private parseResult(result: Judge0Result, expectedOutput?: string): CodeExecutionResult {
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
    const normalize = (s: string) =>
      s.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).join('\n');
    return normalize(actual) === normalize(expected);
  }
}

// Singleton export
export const judge0Service = new Judge0Service();