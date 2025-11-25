import { prisma } from '../../../lib/db';
import { judge0 } from '../../../lib/judge0';
import { DifficultyLevel, SubmissionStatus, Prisma } from '@prisma/client';
import {
  CreateMachineSessionDto,
  RunCodeDto,
  SubmitCodeDto,
  SessionListFilters,
  CodeExecutionResult,
  SubmissionResult,
  TestCaseResult,
  QuestionProgress,
} from './machine.types';
import {
  NotFoundError,
  SessionExpiredError,
  SessionInProgressError,
  SessionAlreadyCompletedError,
  SessionNotCompletedError,
} from '../../../utils/errors';
import {
  calculateTimeRemaining,
  formatTimeRemaining,
  getSessionStatus,
  shuffleArray,
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';

export class MachineService {
  /**
   * Create a new machine coding session
   */
  async createSession(userId: string, dto: CreateMachineSessionDto) {
    // Check for active session
    const activeSession = await prisma.machinePracticeSession.findFirst({
      where: {
        userId,
        completedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeSession) {
      throw new SessionInProgressError(activeSession.id, activeSession.expiresAt);
    }

    // Build where clause for questions
    const whereClause: Prisma.MachineQuestionWhereInput = {
      isActive: true,
      difficulty: dto.difficulty,
    };

    if (dto.tags && dto.tags.length > 0) {
      whereClause.tags = { hasSome: dto.tags };
    }

    // Fetch questions
    const questions = await prisma.machineQuestion.findMany({
      where: whereClause,
    });

    if (questions.length < dto.numberOfQuestions) {
      logger.warn(`Not enough questions. Found: ${questions.length}, Requested: ${dto.numberOfQuestions}`);
    }

    // Randomly select questions
    const selectedQuestions = shuffleArray(questions).slice(0, dto.numberOfQuestions);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + dto.timeLimit * 60 * 1000);

    // Create session
    const session = await prisma.machinePracticeSession.create({
      data: {
        userId,
        difficulty: dto.difficulty,
        numberOfQuestions: selectedQuestions.length,
        timeLimit: dto.timeLimit,
        expiresAt,
        sessionQuestions: {
          create: selectedQuestions.map((q, index) => ({
            questionId: q.id,
            order: index + 1,
          })),
        },
      },
    });

    return {
      id: session.id,
      userId: session.userId,
      difficulty: session.difficulty,
      numberOfQuestions: session.numberOfQuestions,
      timeLimit: session.timeLimit,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      totalScore: session.totalScore,
      totalSolved: session.totalSolved,
      status: 'in_progress',
      createdAt: session.createdAt,
    };
  }

  /**
   * List user's sessions
   */
  async listSessions(userId: string, filters: SessionListFilters) {
    const { page, limit, status, difficulty } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.MachinePracticeSessionWhereInput = { userId };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (status && status !== 'all') {
      const now = new Date();
      if (status === 'completed') {
        where.completedAt = { not: null };
      } else if (status === 'in_progress') {
        where.completedAt = null;
        where.expiresAt = { gt: now };
      } else if (status === 'expired') {
        where.completedAt = null;
        where.expiresAt = { lte: now };
      }
    }

    const totalItems = await prisma.machinePracticeSession.count({ where });

    const sessions = await prisma.machinePracticeSession.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const sessionsWithStatus = sessions.map((session) => ({
      ...session,
      status: getSessionStatus(session.completedAt, session.expiresAt),
      solvedPercentage: session.totalSolved !== null
        ? Math.round((session.totalSolved / session.numberOfQuestions) * 100 * 100) / 100
        : null,
    }));

    return {
      sessions: sessionsWithStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get session details
   */
  async getSessionDetails(userId: string, sessionId: string) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          select: {
            isSolved: true,
            submissions: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const timeRemaining = calculateTimeRemaining(session.expiresAt);
    const solved = session.sessionQuestions.filter((q) => q.isSolved).length;
    const attempted = session.sessionQuestions.filter((q) => q.submissions.length > 0).length;

    return {
      id: session.id,
      userId: session.userId,
      difficulty: session.difficulty,
      numberOfQuestions: session.numberOfQuestions,
      timeLimit: session.timeLimit,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      status,
      timeRemaining,
      timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      progress: {
        solved,
        attempted,
        total: session.numberOfQuestions,
      },
      totalScore: session.totalScore,
      totalSolved: session.totalSolved,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  /**
   * Get all questions in a session
   */
  async getSessionQuestions(userId: string, sessionId: string) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                tags: true,
              },
            },
            submissions: {
              orderBy: { submittedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);

    const questions: QuestionProgress[] = session.sessionQuestions.map((sq) => {
      const bestSubmission = sq.submissions[0];

      return {
        id: sq.question.id,
        sessionQuestionId: sq.id,
        order: sq.order,
        title: sq.question.title,
        difficulty: sq.question.difficulty,
        tags: sq.question.tags,
        isSolved: sq.isSolved,
        submissionCount: sq.submissions.length,
        bestSubmission: bestSubmission
          ? {
              status: bestSubmission.status,
              executionTime: bestSubmission.executionTime || undefined,
              memoryUsed: bestSubmission.memoryUsed || undefined,
              testCasesPassed: bestSubmission.testCasesPassed,
              testCasesTotal: bestSubmission.testCasesTotal,
              submittedAt: bestSubmission.submittedAt,
            }
          : null,
      };
    });

    const solvedCount = session.sessionQuestions.filter((q) => q.isSolved).length;

    return {
      sessionId: session.id,
      status,
      questions,
      totalQuestions: session.numberOfQuestions,
      solvedCount,
    };
  }

  /**
   * Get a specific question with sample test cases
   */
  async getQuestion(userId: string, sessionId: string, questionId: string) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                testCases: {
                  where: { type: 'SAMPLE' },
                  orderBy: { order: 'asc' },
                },
              },
            },
            submissions: {
              orderBy: { submittedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const sessionQuestion = session.sessionQuestions.find(
      (sq) => sq.question.id === questionId
    );

    if (!sessionQuestion) {
      throw new NotFoundError('Question in this session');
    }

    const currentIndex = session.sessionQuestions.findIndex(
      (sq) => sq.question.id === questionId
    );

    // Get total test case count
    const totalTestCases = await prisma.testCase.count({
      where: { questionId },
    });

    const question = sessionQuestion.question;
    const lastSubmission = sessionQuestion.submissions[0];

    return {
      sessionId: session.id,
      sessionQuestionId: sessionQuestion.id,
      question: {
        id: question.id,
        title: question.title,
        description: question.description,
        difficulty: question.difficulty,
        inputFormat: question.inputFormat,
        outputFormat: question.outputFormat,
        constraints: question.constraints,
        tags: question.tags,
        sampleTestCases: question.testCases.map((tc) => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
        totalTestCases,
      },
      isSolved: sessionQuestion.isSolved,
      submissionCount: sessionQuestion.submissions.length,
      lastSubmission: lastSubmission
        ? {
            id: lastSubmission.id,
            status: lastSubmission.status,
            languageId: lastSubmission.languageId,
            testCasesPassed: lastSubmission.testCasesPassed,
            testCasesTotal: lastSubmission.testCasesTotal,
            submittedAt: lastSubmission.submittedAt,
          }
        : null,
      navigation: {
        previousQuestionId:
          currentIndex > 0 ? session.sessionQuestions[currentIndex - 1].question.id : null,
        nextQuestionId:
          currentIndex < session.sessionQuestions.length - 1
            ? session.sessionQuestions[currentIndex + 1].question.id
            : null,
        currentPosition: currentIndex + 1,
        totalQuestions: session.numberOfQuestions,
      },
    };
  }

  /**
   * Run code against sample test cases or custom input
   */
  async runCode(
    userId: string,
    sessionId: string,
    questionId: string,
    dto: RunCodeDto
  ): Promise<CodeExecutionResult> {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          where: {
            question: { id: questionId },
          },
          include: {
            question: {
              include: {
                testCases: {
                  where: { type: 'SAMPLE' },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.completedAt) {
      throw new SessionAlreadyCompletedError(session.completedAt);
    }

    if (new Date() > session.expiresAt) {
      throw new SessionExpiredError(session.expiresAt);
    }

    const sessionQuestion = session.sessionQuestions[0];
    if (!sessionQuestion) {
      throw new NotFoundError('Question in this session');
    }

    // If custom input is provided, run against custom input
    if (dto.customInput !== undefined) {
      return this.runWithCustomInput(sessionId, questionId, dto);
    }

    // Run against sample test cases
    return this.runAgainstSampleTestCases(
      sessionId,
      questionId,
      dto,
      sessionQuestion.question.testCases
    );
  }

  /**
   * Run code with custom input
   */
  private async runWithCustomInput(
    sessionId: string,
    questionId: string,
    dto: RunCodeDto
  ): Promise<CodeExecutionResult> {
    try {
      const token = await judge0.createSubmission({
        source_code: dto.code,
        language_id: dto.languageId,
        stdin: dto.customInput,
      });

      const result = await judge0.waitForResult(token);

      // Check for compilation error
      if (result.status.id === 6) {
        return {
          sessionId,
          questionId,
          executionType: 'custom_input',
          result: {
            input: dto.customInput!,
            output: '',
            executionTime: 0,
            memoryUsed: 0,
            status: 'COMPILATION_ERROR',
          },
          compilationStatus: 'COMPILATION_ERROR',
          compileOutput: result.compile_output,
        };
      }

      return {
        sessionId,
        questionId,
        executionType: 'custom_input',
        result: {
          input: dto.customInput!,
          output: result.stdout?.trim() || '',
          executionTime: parseFloat(result.time || '0') * 1000,
          memoryUsed: result.memory || 0,
          status: result.status.id === 3 ? 'SUCCESS' : judge0.mapStatusToSubmissionStatus(result.status.id),
        },
        compilationStatus: 'SUCCESS',
        compileOutput: null,
      };
    } catch (error) {
      logger.error('Code execution failed', error);
      throw error;
    }
  }

  /**
   * Run code against sample test cases
   */
  private async runAgainstSampleTestCases(
    sessionId: string,
    questionId: string,
    dto: RunCodeDto,
    testCases: Array<{ id: string; input: string; expectedOutput: string }>
  ): Promise<CodeExecutionResult> {
    if (testCases.length === 0) {
      return {
        sessionId,
        questionId,
        executionType: 'sample_test_cases',
        results: [],
        summary: {
          totalTestCases: 0,
          passed: 0,
          failed: 0,
        },
        compilationStatus: 'SUCCESS',
        compileOutput: null,
      };
    }

    try {
      // Create batch submissions
      const submissions = testCases.map((tc) => ({
        source_code: dto.code,
        language_id: dto.languageId,
        stdin: tc.input,
        expected_output: tc.expectedOutput,
      }));

      const tokens = await judge0.createBatchSubmission(submissions);

      // Wait for all results
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const results = await judge0.getBatchSubmission(tokens);

      // Check if any had compilation error
      const compilationError = results.find((r) => r.status.id === 6);
      if (compilationError) {
        return {
          sessionId,
          questionId,
          executionType: 'sample_test_cases',
          results: [],
          summary: {
            totalTestCases: testCases.length,
            passed: 0,
            failed: testCases.length,
          },
          compilationStatus: 'COMPILATION_ERROR',
          compileOutput: compilationError.compile_output,
        };
      }

      // Map results
      const testCaseResults: TestCaseResult[] = results.map((result, index) => {
        const tc = testCases[index];
        const passed = result.status.id === 3;
        const actualOutput = result.stdout?.trim() || '';

        let status: TestCaseResult['status'] = 'PASSED';
        if (!passed) {
          if (result.status.id === 5) {
            status = 'TIME_LIMIT_EXCEEDED';
          } else if (result.status.id >= 7 && result.status.id <= 12) {
            status = 'RUNTIME_ERROR';
          } else {
            status = 'FAILED';
          }
        }

        return {
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          status,
          executionTime: result.time ? parseFloat(result.time) * 1000 : null,
          memoryUsed: result.memory,
          stderr: result.stderr,
        };
      });

      const passedCount = testCaseResults.filter((r) => r.status === 'PASSED').length;
      const executionTimes = testCaseResults
        .filter((r) => r.executionTime !== null)
        .map((r) => r.executionTime!);
      const memoryUsages = testCaseResults
        .filter((r) => r.memoryUsed !== null)
        .map((r) => r.memoryUsed!);

      return {
        sessionId,
        questionId,
        executionType: 'sample_test_cases',
        results: testCaseResults,
        summary: {
          totalTestCases: testCases.length,
          passed: passedCount,
          failed: testCases.length - passedCount,
          averageExecutionTime:
            executionTimes.length > 0
              ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
              : undefined,
          maxMemoryUsed: memoryUsages.length > 0 ? Math.max(...memoryUsages) : undefined,
        },
        compilationStatus: 'SUCCESS',
        compileOutput: null,
      };
    } catch (error) {
      logger.error('Batch code execution failed', error);
      throw error;
    }
  }

  /**
   * Submit code for full evaluation
   */
  async submitCode(
    userId: string,
    sessionId: string,
    questionId: string,
    dto: SubmitCodeDto
  ): Promise<SubmissionResult> {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          where: {
            question: { id: questionId },
          },
          include: {
            question: {
              include: {
                testCases: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.completedAt) {
      throw new SessionAlreadyCompletedError(session.completedAt);
    }

    if (new Date() > session.expiresAt) {
      throw new SessionExpiredError(session.expiresAt);
    }

    const sessionQuestion = session.sessionQuestions[0];
    if (!sessionQuestion) {
      throw new NotFoundError('Question in this session');
    }

    const testCases = sessionQuestion.question.testCases;

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        sessionQuestionId: sessionQuestion.id,
        code: dto.code,
        languageId: dto.languageId,
        status: 'PENDING',
        testCasesTotal: testCases.length,
      },
    });

    try {
      // Run against all test cases
      const submissions = testCases.map((tc) => ({
        source_code: dto.code,
        language_id: dto.languageId,
        stdin: tc.input,
        expected_output: tc.expectedOutput,
      }));

      const tokens = await judge0.createBatchSubmission(submissions);

      // Wait for results
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const results = await judge0.getBatchSubmission(tokens);

      // Check for compilation error
      const compilationError = results.find((r) => r.status.id === 6);
      if (compilationError) {
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'COMPILATION_ERROR',
            compileError: compilationError.compile_output,
            judgedAt: new Date(),
          },
        });

        return {
          submissionId: submission.id,
          sessionId,
          questionId,
          status: 'COMPILATION_ERROR',
          testCasesPassed: 0,
          testCasesTotal: testCases.length,
          executionTime: null,
          memoryUsed: null,
          submittedAt: submission.submittedAt,
          judgedAt: new Date(),
          isSolved: false,
          score: 0,
          message: 'Compilation error. Please check your code.',
        };
      }

      // Calculate results
      let testCasesPassed = 0;
      let totalTime = 0;
      let maxMemory = 0;
      let firstFailedIndex = -1;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id === 3) {
          testCasesPassed++;
          if (result.time) totalTime += parseFloat(result.time) * 1000;
          if (result.memory) maxMemory = Math.max(maxMemory, result.memory);
        } else if (firstFailedIndex === -1) {
          firstFailedIndex = i;
        }
      }

      const allPassed = testCasesPassed === testCases.length;
      let status: SubmissionStatus = 'ACCEPTED';

      if (!allPassed && firstFailedIndex >= 0) {
        const failedResult = results[firstFailedIndex];
        status = judge0.mapStatusToSubmissionStatus(failedResult.status.id) as SubmissionStatus;
      }

      // Update submission
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status,
          testCasesPassed,
          executionTime: totalTime / testCases.length,
          memoryUsed: maxMemory,
          judgedAt: new Date(),
        },
      });

      // Update session question if solved
      if (allPassed && !sessionQuestion.isSolved) {
        await prisma.machineSessionQuestion.update({
          where: { id: sessionQuestion.id },
          data: { isSolved: true },
        });
      }

      const result: SubmissionResult = {
        submissionId: submission.id,
        sessionId,
        questionId,
        status,
        testCasesPassed,
        testCasesTotal: testCases.length,
        executionTime: totalTime / testCases.length,
        memoryUsed: maxMemory,
        submittedAt: submission.submittedAt,
        judgedAt: new Date(),
        isSolved: allPassed,
        score: allPassed ? 100 : 0,
        message: allPassed
          ? 'Congratulations! All test cases passed.'
          : `Wrong answer on some test cases`,
      };

      if (!allPassed && firstFailedIndex >= 0) {
        const failedTC = testCases[firstFailedIndex];
        result.failedTestCase = {
          input: failedTC.type === 'SAMPLE' ? failedTC.input : '[Hidden]',
          expectedOutput: failedTC.type === 'SAMPLE' ? failedTC.expectedOutput : '[Hidden]',
          actualOutput: failedTC.type === 'SAMPLE' ? (results[firstFailedIndex].stdout?.trim() || '[Hidden]') : '[Hidden]',
          message: `Failed on test case ${firstFailedIndex + 1} of ${testCases.length}`,
        };
      }

      return result;
    } catch (error) {
      logger.error('Submission evaluation failed', error);

      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: 'RUNTIME_ERROR',
          stderr: error instanceof Error ? error.message : 'Unknown error',
          judgedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(userId: string, sessionId: string) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            submissions: {
              orderBy: { submittedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const timeRemaining = calculateTimeRemaining(session.expiresAt);

    const solved = session.sessionQuestions.filter((q) => q.isSolved).length;
    const attempted = session.sessionQuestions.filter((q) => q.submissions.length > 0).length;
    const unattempted = session.numberOfQuestions - attempted;

    const allSubmissions = session.sessionQuestions.flatMap((q) => q.submissions);
    const acceptedSubmissions = allSubmissions.filter((s) => s.status === 'ACCEPTED').length;
    const lastSubmission = allSubmissions.sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    )[0];

    return {
      sessionId,
      status,
      timeRemaining,
      timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      progress: {
        solved,
        attempted,
        unattempted,
        total: session.numberOfQuestions,
        solvedPercentage: Math.round((solved / session.numberOfQuestions) * 100 * 100) / 100,
      },
      submissionStats: {
        totalSubmissions: allSubmissions.length,
        acceptedSubmissions,
        lastSubmissionAt: lastSubmission?.submittedAt || null,
      },
    };
  }

  /**
   * Complete/End session
   */
  async completeSession(userId: string, sessionId: string) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
              },
            },
            submissions: {
              orderBy: { submittedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.completedAt) {
      throw new SessionAlreadyCompletedError(session.completedAt);
    }

    const totalSolved = session.sessionQuestions.filter((q) => q.isSolved).length;
    const totalScore = totalSolved * 100;
    const completedAt = new Date();
    const timeTaken = Math.floor(
      (completedAt.getTime() - session.startedAt.getTime()) / 60000
    );

    // Update session
    await prisma.machinePracticeSession.update({
      where: { id: sessionId },
      data: {
        completedAt,
        totalScore,
        totalSolved,
      },
    });

    const questions = session.sessionQuestions.map((sq) => {
      const bestSubmission = sq.submissions.find((s) => s.status === 'ACCEPTED') || sq.submissions[0];
      return {
        id: sq.question.id,
        title: sq.question.title,
        isSolved: sq.isSolved,
        submissionCount: sq.submissions.length,
        bestStatus: bestSubmission?.status || null,
      };
    });

    return {
      sessionId,
      status: 'completed',
      completedAt,
      timeTaken,
      results: {
        totalSolved,
        totalQuestions: session.numberOfQuestions,
        totalScore,
        solvedPercentage: Math.round((totalSolved / session.numberOfQuestions) * 100 * 100) / 100,
        questions,
      },
    };
  }

  /**
   * Get session results
   */
  async getSessionResults(userId: string, sessionId: string) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                tags: true,
              },
            },
            submissions: {
              orderBy: { submittedAt: 'desc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (!session.completedAt) {
      throw new SessionNotCompletedError();
    }

    const timeTaken = Math.floor(
      (session.completedAt.getTime() - session.startedAt.getTime()) / 60000
    );

    const totalSubmissions = session.sessionQuestions.reduce(
      (sum, q) => sum + q.submissions.length,
      0
    );

    const questions = session.sessionQuestions.map((sq) => {
      const bestSubmission =
        sq.submissions.find((s) => s.status === 'ACCEPTED') || sq.submissions[0];

      // Get language name
      const getLanguageName = (id: number) => {
        const languages: Record<number, string> = {
          50: 'C (GCC 9.2.0)',
          54: 'C++ (GCC 9.2.0)',
          62: 'Java (OpenJDK 13.0.1)',
          63: 'JavaScript (Node.js 12.14.0)',
          71: 'Python (3.8.1)',
          60: 'Go (1.13.5)',
          73: 'Rust (1.40.0)',
        };
        return languages[id] || `Language ${id}`;
      };

      return {
        order: sq.order,
        id: sq.question.id,
        title: sq.question.title,
        difficulty: sq.question.difficulty,
        tags: sq.question.tags,
        isSolved: sq.isSolved,
        score: sq.isSolved ? 100 : 0,
        submissionCount: sq.submissions.length,
        bestSubmission: bestSubmission
          ? {
              id: bestSubmission.id,
              status: bestSubmission.status,
              executionTime: bestSubmission.executionTime,
              memoryUsed: bestSubmission.memoryUsed,
              languageId: bestSubmission.languageId,
              language: getLanguageName(bestSubmission.languageId),
              submittedAt: bestSubmission.submittedAt,
            }
          : null,
      };
    });

    const performance = this.evaluateMachinePerformance(
      session.totalSolved!,
      session.numberOfQuestions,
      session.difficulty
    );

    return {
      sessionId,
      status: 'completed',
      completedAt: session.completedAt,
      timeTaken,
      timeLimit: session.timeLimit,
      difficulty: session.difficulty,
      summary: {
        totalSolved: session.totalSolved,
        totalQuestions: session.numberOfQuestions,
        totalScore: session.totalScore,
        maxPossibleScore: session.numberOfQuestions * 100,
        solvedPercentage: Math.round((session.totalSolved! / session.numberOfQuestions) * 100 * 100) / 100,
        totalSubmissions,
      },
      questions,
      performance,
    };
  }

  /**
   * Get submission history for a question
   */
  async getSubmissionHistory(
    userId: string,
    sessionId: string,
    questionId: string,
    page: number,
    limit: number
  ) {
    const session = await prisma.machinePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          where: {
            question: { id: questionId },
          },
          include: {
            question: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const sessionQuestion = session.sessionQuestions[0];
    if (!sessionQuestion) {
      throw new NotFoundError('Question in this session');
    }

    const skip = (page - 1) * limit;

    const totalItems = await prisma.submission.count({
      where: { sessionQuestionId: sessionQuestion.id },
    });

    const submissions = await prisma.submission.findMany({
      where: { sessionQuestionId: sessionQuestion.id },
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
    });

    const getLanguageName = (id: number) => {
      const languages: Record<number, string> = {
        50: 'C (GCC 9.2.0)',
        54: 'C++ (GCC 9.2.0)',
        62: 'Java (OpenJDK 13.0.1)',
        63: 'JavaScript (Node.js 12.14.0)',
        71: 'Python (3.8.1)',
        60: 'Go (1.13.5)',
        73: 'Rust (1.40.0)',
      };
      return languages[id] || `Language ${id}`;
    };

    const mappedSubmissions = submissions.map((s) => ({
      id: s.id,
      status: s.status,
      languageId: s.languageId,
      language: getLanguageName(s.languageId),
      executionTime: s.executionTime,
      memoryUsed: s.memoryUsed,
      testCasesPassed: s.testCasesPassed,
      testCasesTotal: s.testCasesTotal,
      submittedAt: s.submittedAt,
      judgedAt: s.judgedAt,
    }));

    const acceptedSubmissions = submissions.filter((s) => s.status === 'ACCEPTED');
    const wrongAnswerCount = submissions.filter((s) => s.status === 'WRONG_ANSWER').length;
    const compilationErrorCount = submissions.filter((s) => s.status === 'COMPILATION_ERROR').length;

    return {
      sessionId,
      questionId,
      questionTitle: sessionQuestion.question.title,
      submissions: mappedSubmissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1,
      },
      stats: {
        totalSubmissions: totalItems,
        acceptedCount: acceptedSubmissions.length,
        wrongAnswerCount,
        compilationErrorCount,
        firstAcceptedAt: acceptedSubmissions.length > 0
          ? acceptedSubmissions[acceptedSubmissions.length - 1].submittedAt
          : null,
      },
    };
  }

  /**
   * Get specific submission details
   */
  async getSubmissionDetails(userId: string, submissionId: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        sessionQuestion: {
          include: {
            session: true,
            question: {
              include: {
                testCases: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission');
    }

    if (submission.sessionQuestion.session.userId !== userId) {
      throw new NotFoundError('Submission');
    }

    const getLanguageName = (id: number) => {
      const languages: Record<number, string> = {
        50: 'C (GCC 9.2.0)',
        54: 'C++ (GCC 9.2.0)',
        62: 'Java (OpenJDK 13.0.1)',
        63: 'JavaScript (Node.js 12.14.0)',
        71: 'Python (3.8.1)',
        60: 'Go (1.13.5)',
        73: 'Rust (1.40.0)',
      };
      return languages[id] || `Language ${id}`;
    };

    // For completed sessions, show test case results
    const testCaseResults = submission.sessionQuestion.question.testCases.map((tc, index) => ({
      testCaseNumber: index + 1,
      type: tc.type,
      status: index < submission.testCasesPassed ? 'PASSED' : 'FAILED',
      input: tc.type === 'SAMPLE' ? tc.input : '[Hidden]',
      expectedOutput: tc.type === 'SAMPLE' ? tc.expectedOutput : '[Hidden]',
      actualOutput: tc.type === 'SAMPLE' ? '[Shown for sample only]' : '[Hidden]',
    }));

    return {
      id: submission.id,
      sessionId: submission.sessionQuestion.sessionId,
      questionId: submission.sessionQuestion.questionId,
      questionTitle: submission.sessionQuestion.question.title,
      code: submission.code,
      languageId: submission.languageId,
      language: getLanguageName(submission.languageId),
      status: submission.status,
      executionTime: submission.executionTime,
      memoryUsed: submission.memoryUsed,
      testCasesPassed: submission.testCasesPassed,
      testCasesTotal: submission.testCasesTotal,
      stdout: submission.stdout,
      stderr: submission.stderr,
      compileError: submission.compileError,
      submittedAt: submission.submittedAt,
      judgedAt: submission.judgedAt,
      testCaseResults,
    };
  }

  /**
   * Evaluate machine coding performance
   */
  private evaluateMachinePerformance(
    solved: number,
    total: number,
    difficulty: DifficultyLevel
  ) {
    const solvedPercentage = (solved / total) * 100;
    const suggestions: string[] = [];

    let rank: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    let message: string;

    const thresholds = {
      EASY: { excellent: 100, good: 80, average: 50 },
      MEDIUM: { excellent: 100, good: 66, average: 33 },
      HARD: { excellent: 100, good: 50, average: 25 },
    };

    const t = thresholds[difficulty];

    if (solvedPercentage >= t.excellent) {
      rank = 'EXCELLENT';
      message = 'Outstanding! You solved all problems.';
    } else if (solvedPercentage >= t.good) {
      rank = 'GOOD';
      message = `Good performance! You solved ${solved} out of ${total} problems.`;
    } else if (solvedPercentage >= t.average) {
      rank = 'AVERAGE';
      message = 'Keep practicing to improve your problem-solving skills.';
    } else {
      rank = 'NEEDS_IMPROVEMENT';
      message = 'Focus on fundamentals and practice more problems.';
    }

    if (solved < total) {
      suggestions.push('Review the unsolved problems and learn from their solutions');
    }

    if (difficulty !== 'EASY' && solvedPercentage < 50) {
      suggestions.push('Consider practicing with easier problems first');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try challenging yourself with harder problems');
    }

    return { rank, message, suggestions };
  }
}

export const machineService = new MachineService();