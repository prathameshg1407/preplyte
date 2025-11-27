// src/module/mock-drive/attempt/executors/machine.executor.ts

import { PrismaClient, SubmissionStatus, TestCaseType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  BaseModuleExecutor,
  ModuleExecutorContext,
  InitializeResult,
  SubmitResult,
} from './base.executor';
import {
  MachineModuleConfig,
  MachineModuleData,
  MachineQuestionAttempt,
  MachineSubmissionData,
  MachineModuleSummary,
  ModuleData,
} from '../../shared';
import { calculateMachineScore } from '../../utils/scoring.utils';
import { NotFoundError, BadRequestError, InternalError } from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';
import {
  judge0Service,
  mapJudge0StatusToSubmissionStatus,
  Judge0StatusId,
} from '../../../../lib/judge0';

// ============================================
// Types
// ============================================

interface SubmitPayload {
  questionId: string;
  code: string;
  languageId: number;
}

interface RunPayload {
  questionId: string;
  code: string;
  languageId: number;
  customInput?: string;
}

interface ExecutionResult {
  status: SubmissionStatus;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number | null;
  memoryUsed: number | null;
  stdout: string | null;
  stderr: string | null;
  compileError: string | null;
  testCaseResults?: TestCaseResult[];
}

interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  executionTime: number | null;
  memoryUsed: number | null;
  error: string | null;
}

interface RunResult {
  stdout: string | null;
  stderr: string | null;
  compileError: string | null;
  executionTime: number | null;
  memoryUsed: number | null;
  status: string;
  statusId: number;
}

interface TestCaseData {
  id: string;
  input: string;
  expectedOutput: string;
  type: TestCaseType;
}

// ============================================
// Constants
// ============================================

const VALID_ACTIONS = ['submit', 'run'] as const;
type MachineAction = typeof VALID_ACTIONS[number];

const DEFAULT_TIME_LIMIT = 5; // seconds
const DEFAULT_MEMORY_LIMIT = 256000; // KB (256MB)

// ============================================
// Type Guards
// ============================================

function isSubmitPayload(payload: unknown): payload is SubmitPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.questionId === 'string' &&
    typeof p.code === 'string' &&
    typeof p.languageId === 'number'
  );
}

function isRunPayload(payload: unknown): payload is RunPayload {
  return isSubmitPayload(payload);
}

function isMachineAction(action: string): action is MachineAction {
  return VALID_ACTIONS.includes(action as MachineAction);
}

function isMachineModuleData(data: ModuleData | null): data is MachineModuleData {
  if (data === null) return false;
  return 'questions' in data && Array.isArray((data as MachineModuleData).questions);
}

// ============================================
// Executor Implementation
// ============================================

export class MachineModuleExecutor extends BaseModuleExecutor {
  constructor(prisma: PrismaClient) {
    super(prisma, 'MACHINE_CODING');
  }

  async initialize(context: ModuleExecutorContext): Promise<InitializeResult> {
    this.validateContext(context);

    const moduleQuestions = await this.prisma.mockDriveModuleQuestion.findMany({
      where: { moduleId: context.moduleId },
      orderBy: { order: 'asc' },
      include: { machineQuestion: true },
    });

    if (moduleQuestions.length === 0) {
      throw new NotFoundError('Questions for this module');
    }

    const questions: MachineQuestionAttempt[] = moduleQuestions.map((mq, index) => {
      if (!mq.machineQuestionId) {
        throw new InternalError(`Invalid question configuration for module question ${mq.id}`);
      }

      return {
        questionId: mq.id,
        machineQuestionId: mq.machineQuestionId,
        displayOrder: index,
        submissions: [],
        bestSubmissionId: null,
        bestScore: 0,
        isSolved: false,
      };
    });

    return { data: { questions } };
  }

  async handleAction(
    context: ModuleExecutorContext,
    action: string,
    payload: unknown
  ): Promise<Partial<MachineModuleData>> {
    if (!isMachineAction(action)) {
      throw new BadRequestError(`Unknown action: ${action}`);
    }

    if (!isMachineModuleData(context.existingData)) {
      throw new InternalError('Module not properly initialized');
    }

    switch (action) {
      case 'submit':
        return this.handleSubmit(context, context.existingData, payload);
      case 'run':
        return this.handleRun(context, context.existingData, payload);
    }
  }

  async finalize(context: ModuleExecutorContext): Promise<SubmitResult> {
    if (!isMachineModuleData(context.existingData)) {
      throw new InternalError('Module data not found');
    }

    const config = context.config as MachineModuleConfig;
    const summary = this.calculateSummary(context.existingData.questions, config);

    const finalData: MachineModuleData = {
      questions: context.existingData.questions,
      summary,
    };

    const { score, percentage } = calculateMachineScore(finalData, config);

    const isPassed = config.passingScore !== undefined
      ? percentage >= config.passingScore
      : true;

    return {
      data: finalData,
      score,
      maxScore: summary.maxScore,
      percentage,
      isPassed,
    };
  }

  // ============================================
  // Action Handlers
  // ============================================

  private async handleSubmit(
    context: ModuleExecutorContext,
    data: MachineModuleData,
    payload: unknown
  ): Promise<Partial<MachineModuleData>> {
    if (!isSubmitPayload(payload)) {
      throw new BadRequestError('Invalid submit payload: questionId, code, and languageId required');
    }

    const config = context.config as MachineModuleConfig;

    const questionIndex = data.questions.findIndex(
      (q) => q.questionId === payload.questionId
    );

    if (questionIndex === -1) {
      throw new NotFoundError('Question in attempt');
    }

    // Validate language
    const language = await this.validateLanguage(payload.languageId, config);

    // Get question with test cases
    const moduleQuestion = await this.prisma.mockDriveModuleQuestion.findUnique({
      where: { id: payload.questionId },
      include: {
        machineQuestion: {
          include: { testCases: { orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!moduleQuestion?.machineQuestion) {
      throw new NotFoundError('Question data');
    }

    const testCases: TestCaseData[] = moduleQuestion.machineQuestion.testCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      type: tc.type,
    }));

    if (testCases.length === 0) {
      throw new InternalError('No test cases configured for this question');
    }

    // Execute code against all test cases using Judge0
    const executionResult = await this.executeCode(
      payload.code,
      payload.languageId,
      testCases,
      config
    );

    // Create submission record
    const submission = this.createSubmission(
      payload,
      language?.name || 'Unknown',
      executionResult
    );

    // Update question data
    return this.updateQuestionWithSubmission(
      data,
      questionIndex,
      submission,
      testCases.length,
      config
    );
  }

  private async handleRun(
    context: ModuleExecutorContext,
    data: MachineModuleData,
    payload: unknown
  ): Promise<Partial<MachineModuleData>> {
    if (!isRunPayload(payload)) {
      throw new BadRequestError('Invalid run payload: questionId, code, and languageId required');
    }

    const config = context.config as MachineModuleConfig;
    await this.validateLanguage(payload.languageId, config);

    const questionIndex = data.questions.findIndex(
      (q) => q.questionId === payload.questionId
    );

    if (questionIndex === -1) {
      throw new NotFoundError('Question in attempt');
    }

    logger.info('[MachineExecutor] Running code with custom input', {
      questionId: payload.questionId,
      languageId: payload.languageId,
      hasCustomInput: !!payload.customInput,
    });

    // Execute with custom input (no test case validation)
    const result = await this.runCodeWithInput(
      payload.code,
      payload.languageId,
      payload.customInput || ''
    );

    // Return execution result without modifying submission data
    return {
      questions: data.questions,
      _runResult: {
        stdout: result.stdout,
        stderr: result.stderr,
        executionTime: result.executionTime,
      },
    };
  }

  // ============================================
  // Code Execution with Judge0
  // ============================================

  private async executeCode(
    code: string,
    languageId: number,
    testCases: TestCaseData[],
    config: MachineModuleConfig
  ): Promise<ExecutionResult> {
    const timeLimit = (config as { timeLimit?: number }).timeLimit || DEFAULT_TIME_LIMIT;
    
    logger.info('[MachineExecutor] Executing code against test cases', {
      languageId,
      testCaseCount: testCases.length,
      timeLimit,
    });

    try {
      // Get language name for Judge0 service
      const language = await this.prisma.programmingLanguage.findUnique({
        where: { judge0Id: languageId },
      });

      if (!language) {
        throw new BadRequestError(`Unsupported language ID: ${languageId}`);
      }

      // Use Judge0 batch execution
      const batchResult = await judge0Service.executeBatch(
        code,
        language.name.toLowerCase(),
        'mock-drive-submission',
        testCases.map((tc) => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
        timeLimit
      );

      // Map batch results to our format
      const testCaseResults: TestCaseResult[] = batchResult.results.map((result, index) => ({
        testCaseId: testCases[index].id,
        passed: result.isCorrect,
        input: testCases[index].type === 'SAMPLE' ? result.input : '[Hidden]',
        expectedOutput: testCases[index].type === 'SAMPLE' ? result.expectedOutput : '[Hidden]',
        actualOutput: testCases[index].type === 'SAMPLE' ? result.actualOutput : '[Hidden]',
        executionTime: parseFloat(result.executionTime) || null,
        memoryUsed: result.memoryUsed || null,
        error: result.error || null,
      }));

      // Determine overall status
      const status = this.determineOverallStatus(batchResult.results);

      // Find first error for compile/runtime errors
      const firstError = batchResult.results.find((r) => r.error);
      const isCompileError = firstError?.statusId === Judge0StatusId.COMPILATION_ERROR;

      return {
        status,
        testCasesPassed: batchResult.passedTestCases,
        totalTestCases: batchResult.totalTestCases,
        executionTime: batchResult.totalExecutionTime,
        memoryUsed: Math.round(batchResult.averageMemory),
        stdout: null,
        stderr: isCompileError ? null : (firstError?.error || null),
        compileError: isCompileError ? (firstError?.error || null) : null,
        testCaseResults,
      };
    } catch (error) {
      logger.error('[MachineExecutor] Code execution failed', { error });

      // Return error result
      return {
        status: 'RUNTIME_ERROR',
        testCasesPassed: 0,
        totalTestCases: testCases.length,
        executionTime: null,
        memoryUsed: null,
        stdout: null,
        stderr: error instanceof Error ? error.message : 'Execution failed',
        compileError: null,
        testCaseResults: [],
      };
    }
  }

  private async runCodeWithInput(
    code: string,
    languageId: number,
    input: string
  ): Promise<RunResult> {
    logger.info('[MachineExecutor] Running code with custom input', { languageId });

    try {
      // Get language name
      const language = await this.prisma.programmingLanguage.findUnique({
        where: { judge0Id: languageId },
      });

      if (!language) {
        throw new BadRequestError(`Unsupported language ID: ${languageId}`);
      }

      // Execute single run
      const result = await judge0Service.runCode(
        code,
        language.name.toLowerCase(),
        input
      );

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        compileError: result.compileOutput,
        executionTime: parseFloat(result.executionTime) || null,
        memoryUsed: result.memoryUsed,
        status: result.status,
        statusId: result.statusId,
      };
    } catch (error) {
      logger.error('[MachineExecutor] Code run failed', { error });

      return {
        stdout: null,
        stderr: error instanceof Error ? error.message : 'Execution failed',
        compileError: null,
        executionTime: null,
        memoryUsed: null,
        status: 'Error',
        statusId: -1,
      };
    }
  }

  private determineOverallStatus(
    results: Array<{ statusId: number; isCorrect: boolean }>
  ): SubmissionStatus {
    // Check for compilation error first
    const hasCompileError = results.some(
      (r) => r.statusId === Judge0StatusId.COMPILATION_ERROR
    );
    if (hasCompileError) {
      return 'COMPILATION_ERROR';
    }

    // Check for runtime errors
    const hasRuntimeError = results.some(
      (r) =>
        r.statusId >= Judge0StatusId.RUNTIME_ERROR_SIGSEGV &&
        r.statusId <= Judge0StatusId.RUNTIME_ERROR_OTHER
    );
    if (hasRuntimeError) {
      return 'RUNTIME_ERROR';
    }

    // Check for TLE
    const hasTLE = results.some(
      (r) => r.statusId === Judge0StatusId.TIME_LIMIT_EXCEEDED
    );
    if (hasTLE) {
      return 'TIME_LIMIT_EXCEEDED';
    }

    // Check if all passed
    const allPassed = results.every((r) => r.isCorrect);
    if (allPassed) {
      return 'ACCEPTED';
    }

    // Some failed
    return 'WRONG_ANSWER';
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async validateLanguage(
    languageId: number,
    config: MachineModuleConfig
  ): Promise<{ name: string } | null> {
    const language = await this.prisma.programmingLanguage.findUnique({
      where: { judge0Id: languageId },
    });

    if (!language) {
      throw new BadRequestError(`Unsupported language ID: ${languageId}`);
    }

    if (config.allowedLanguages.length > 0) {
      // Check if language name matches any allowed language (case-insensitive)
      const isAllowed = config.allowedLanguages.some(
        (allowed) => allowed.toLowerCase() === language.name.toLowerCase() ||
          language.name.toLowerCase().includes(allowed.toLowerCase())
      );
      
      if (!isAllowed) {
        throw new BadRequestError(
          `Language "${language.name}" not allowed. Allowed: ${config.allowedLanguages.join(', ')}`
        );
      }
    }

    return language;
  }

  private createSubmission(
    payload: SubmitPayload,
    languageName: string,
    result: ExecutionResult
  ): MachineSubmissionData {
    return {
      id: uuidv4(),
      code: payload.code,
      languageId: payload.languageId,
      languageName,
      status: result.status,
      testCasesPassed: result.testCasesPassed,
      testCasesTotal: result.totalTestCases,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      stdout: result.stdout,
      stderr: result.stderr,
      compileError: result.compileError,
      submittedAt: new Date().toISOString(),
    };
  }

  private updateQuestionWithSubmission(
    data: MachineModuleData,
    questionIndex: number,
    submission: MachineSubmissionData,
    testCasesTotal: number,
    config: MachineModuleConfig
  ): Partial<MachineModuleData> {
    const submissionScore = this.calculateSubmissionScore(
      submission,
      testCasesTotal,
      config
    );

    const existingQuestion = data.questions[questionIndex];
    const updatedQuestions = [...data.questions];

    const isSolved = submission.testCasesPassed === testCasesTotal && 
                     submission.status === 'ACCEPTED';
    const isBetterScore = submissionScore > existingQuestion.bestScore;

    updatedQuestions[questionIndex] = {
      ...existingQuestion,
      submissions: [...existingQuestion.submissions, submission],
      bestSubmissionId: isBetterScore ? submission.id : existingQuestion.bestSubmissionId,
      bestScore: isBetterScore ? submissionScore : existingQuestion.bestScore,
      isSolved: existingQuestion.isSolved || isSolved,
    };

    return { questions: updatedQuestions };
  }

  private calculateSubmissionScore(
    submission: MachineSubmissionData,
    testCasesTotal: number,
    config: MachineModuleConfig
  ): number {
    if (testCasesTotal === 0) return 0;

    // If compilation error or runtime error before any test, score is 0
    if (
      submission.status === 'COMPILATION_ERROR' ||
      (submission.status === 'RUNTIME_ERROR' && submission.testCasesPassed === 0)
    ) {
      return 0;
    }

    if (config.partialScoring) {
      // Partial scoring: proportional to test cases passed
      return (submission.testCasesPassed / testCasesTotal) * config.maxScorePerQuestion;
    }

    // All-or-nothing scoring
    return submission.testCasesPassed === testCasesTotal && submission.status === 'ACCEPTED'
      ? config.maxScorePerQuestion
      : 0;
  }

  private calculateSummary(
    questions: MachineQuestionAttempt[],
    config: MachineModuleConfig
  ): MachineModuleSummary {
    let totalSolved = 0;
    let totalPartial = 0;
    let totalUnattempted = 0;
    let totalScore = 0;

    for (const question of questions) {
      if (question.isSolved) {
        totalSolved++;
        totalScore += config.maxScorePerQuestion;
      } else if (question.bestScore > 0) {
        totalPartial++;
        totalScore += question.bestScore;
      } else if (question.submissions.length === 0) {
        totalUnattempted++;
      }
      // Questions with submissions but 0 score are neither solved, partial, nor unattempted
    }

    return {
      totalQuestions: questions.length,
      totalSolved,
      totalPartial,
      totalUnattempted,
      totalScore,
      maxScore: questions.length * config.maxScorePerQuestion,
    };
  }
}