// src/module/practice/individual-mockdrive/individual-mockdrive.service.ts

import { prisma } from '../../../lib/db';
import { 
  MockDriveAttemptStatus, 
  MockDriveModuleAttemptStatus,
  MockDriveModuleType,
  Prisma,
  DifficultyLevel,
  QuestionType
} from '@prisma/client';
import { 
  CreateIndividualMockDriveDTO, 
  IndividualMockDriveDetails,
  IndividualMockDriveListItem,
  IndividualMockDriveAttemptListItem,
  UpdateIndividualMockDriveDTO
} from './individual-mockdrive.types';

export class IndividualMockDriveService {
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private parseDifficultyLevel(value: unknown): DifficultyLevel {
    if (value === DifficultyLevel.EASY || value === DifficultyLevel.MEDIUM || value === DifficultyLevel.HARD) {
      return value;
    }
    return DifficultyLevel.MEDIUM;
  }

  private parseQuestionTypes(value: unknown): QuestionType[] {
    if (!Array.isArray(value)) {
      return [QuestionType.QUANTITATIVE, QuestionType.LOGICAL];
    }

    const valid = value.filter(
      (type): type is QuestionType =>
        type === QuestionType.QUANTITATIVE ||
        type === QuestionType.VERBAL ||
        type === QuestionType.LOGICAL ||
        type === QuestionType.DATA_INTERPRETATION
    );

    return valid.length > 0 ? valid : [QuestionType.QUANTITATIVE, QuestionType.LOGICAL];
  }

  private async createAptitudeSubSession(userId: string, module: { timeLimit: number; config: Prisma.JsonValue }) {
    const config = (module.config as Record<string, unknown>) || {};
    const numberOfQuestions = Math.max(1, Number(config.numberOfQuestions ?? 20));
    const difficulty = this.parseDifficultyLevel(config.difficulty);
    const questionTypes = this.parseQuestionTypes(config.questionTypes);

    const questionPool = await prisma.aptitudeQuestion.findMany({
      where: {
        isActive: true,
        difficulty,
        questionType: { in: questionTypes },
      },
      select: { id: true },
      take: numberOfQuestions * 3,
    });

    if (questionPool.length < numberOfQuestions) {
      throw new Error(`Not enough aptitude questions available (found ${questionPool.length}, need ${numberOfQuestions})`);
    }

    const selectedQuestions = this.shuffleArray(questionPool).slice(0, numberOfQuestions);
    const expiresAt = new Date(Date.now() + module.timeLimit * 60 * 1000);

    const session = await prisma.aptitudePracticeSession.create({
      data: {
        userId,
        difficulty,
        questionTypes,
        numberOfQuestions,
        timeLimit: module.timeLimit,
        expiresAt,
        sessionQuestions: {
          createMany: {
            data: selectedQuestions.map((question, index) => ({
              questionId: question.id,
              order: index + 1,
            })),
          },
        },
      },
      select: { id: true },
    });

    return session.id;
  }

  private async createMachineSubSession(userId: string, module: { timeLimit: number; config: Prisma.JsonValue }) {
    const config = (module.config as Record<string, unknown>) || {};
    const numberOfQuestions = Math.max(1, Number(config.numberOfQuestions ?? 2));
    const difficulty = this.parseDifficultyLevel(config.difficulty);

    const questionPool = await prisma.machineQuestion.findMany({
      where: {
        isActive: true,
        difficulty,
      },
      select: { id: true },
      take: numberOfQuestions * 3,
    });

    if (questionPool.length < numberOfQuestions) {
      throw new Error(`Not enough machine coding questions available (found ${questionPool.length}, need ${numberOfQuestions})`);
    }

    const selectedQuestions = this.shuffleArray(questionPool).slice(0, numberOfQuestions);
    const expiresAt = new Date(Date.now() + module.timeLimit * 60 * 1000);

    const session = await prisma.machinePracticeSession.create({
      data: {
        userId,
        difficulty,
        numberOfQuestions,
        timeLimit: module.timeLimit,
        expiresAt,
        sessionQuestions: {
          create: selectedQuestions.map((question, index) => ({
            questionId: question.id,
            order: index + 1,
          })),
        },
      },
      select: { id: true },
    });

    return session.id;
  }

  private getMockDriveModuleRedirectUrl(params: {
    mockDriveId: string;
    attemptId: string;
    moduleId: string;
    moduleType: MockDriveModuleType;
    sessionId: string;
    moduleAttemptId: string;
  }): string {
    const { mockDriveId, attemptId, moduleId, moduleType, sessionId, moduleAttemptId } = params;
    const qs = new URLSearchParams({
      sessionId,
      moduleType,
      moduleAttemptId,
    });

    return `/practice/mockdrive/${mockDriveId}/attempt/${attemptId}/module/${moduleId}?${qs.toString()}`;
  }

  /**
   * Create a new individual mock drive
   */
  async create(userId: string, data: CreateIndividualMockDriveDTO): Promise<IndividualMockDriveDetails> {
    return await prisma.$transaction(async (tx) => {
      const mockDrive = await tx.individualMockDrive.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          modules: {
            create: data.modules.map(m => ({
              moduleType: m.moduleType,
              order: m.order,
              name: m.name,
              timeLimit: m.timeLimit,
              config: m.config as unknown as Prisma.InputJsonValue
            }))
          }
        },
        include: {
          modules: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: { modules: true, attempts: true }
          }
        }
      });

      return mockDrive as unknown as IndividualMockDriveDetails;
    });
  }

  /**
   * List all mock drives for a user
   */
  async findAll(userId: string): Promise<IndividualMockDriveListItem[]> {
    const drives = await prisma.individualMockDrive.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { modules: true, attempts: true }
        }
      }
    });

    return drives as IndividualMockDriveListItem[];
  }

  /**
   * Get a single mock drive with details
   */
  async findOne(id: string, userId: string): Promise<IndividualMockDriveDetails> {
    const mockDrive = await prisma.individualMockDrive.findFirst({
      where: { id, userId, isActive: true },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { modules: true, attempts: true }
        }
      }
    });

    if (!mockDrive) {
      throw new Error('Individual MockDrive not found');
    }

    return mockDrive as unknown as IndividualMockDriveDetails;
  }

  /**
   * Delete a mock drive
   */
  async delete(id: string, userId: string): Promise<void> {
    await prisma.individualMockDrive.deleteMany({
      where: { id, userId }
    });
  }

  /**
   * Update a mock drive
   */
  async update(id: string, userId: string, data: UpdateIndividualMockDriveDTO): Promise<IndividualMockDriveDetails> {
    const existing = await prisma.individualMockDrive.findFirst({
      where: { id, userId },
      select: { id: true }
    });

    if (!existing) {
      throw new Error('Individual MockDrive not found');
    }

    const updated = await prisma.individualMockDrive.update({
      where: { id },
      data,
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { modules: true, attempts: true }
        }
      }
    });

    return updated as unknown as IndividualMockDriveDetails;
  }

  /**
   * Start a new attempt for a mock drive
   */
  async startAttempt(mockDriveId: string, userId: string) {
    const mockDrive = await this.findOne(mockDriveId, userId);
    const firstOrder = Math.min(...mockDrive.modules.map((m) => m.order));

    return await prisma.$transaction(async (tx) => {
      // Check for existing in-progress attempt
      const existing = await tx.individualMockDriveAttempt.findFirst({
        where: { userId, status: MockDriveAttemptStatus.IN_PROGRESS }
      });

      if (existing) {
        if (existing.mockDriveId === mockDriveId) {
          // Reuse same-drive in-progress attempt.
          return existing;
        }

        // User is starting a different drive: gracefully abandon old attempt.
        await tx.individualMockDriveAttempt.update({
          where: { id: existing.id },
          data: {
            status: MockDriveAttemptStatus.ABANDONED,
            completedAt: new Date(),
          },
        });
      }

      // Create main attempt record
      const attempt = await tx.individualMockDriveAttempt.create({
        data: {
          mockDriveId,
          userId,
          status: MockDriveAttemptStatus.IN_PROGRESS,
          currentModuleOrder: 0,
          startedAt: new Date(),
        }
      });

      // Create module attempts
      await tx.individualMockDriveModuleAttempt.createMany({
        data: mockDrive.modules.map(m => ({
          attemptId: attempt.id,
          moduleId: m.id,
          status: m.order === firstOrder ? MockDriveModuleAttemptStatus.AVAILABLE : MockDriveModuleAttemptStatus.LOCKED,
        }))
      });

      return attempt;
    });
  }

  /**
   * Get current active attempt for a user
   */
  async getCurrentAttempt(userId: string) {
    return await prisma.individualMockDriveAttempt.findFirst({
      where: { userId, status: MockDriveAttemptStatus.IN_PROGRESS },
      include: {
        mockDrive: {
          include: {
            modules: { orderBy: { order: 'asc' } }
          }
        },
        moduleAttempts: {
          include: { module: true }
        }
      }
    });
  }

  /**
   * Get an attempt by id scoped to user
   */
  async getAttemptById(attemptId: string, userId: string) {
    const attempt = await prisma.individualMockDriveAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        mockDrive: {
          include: {
            modules: { orderBy: { order: 'asc' } },
            _count: { select: { modules: true } }
          }
        },
        moduleAttempts: {
          include: { module: true }
        }
      }
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    return attempt;
  }

  /**
   * Start a specific module in an attempt
   */
  async startModule(attemptId: string, moduleId: string, userId: string): Promise<{ moduleAttempt: any; redirectUrl: string }> {
    const attempt = await prisma.individualMockDriveAttempt.findFirst({
      where: { id: attemptId, userId },
      include: { 
        mockDrive: true,
        moduleAttempts: {
          include: { module: true }
        }
      }
    });

    if (!attempt) throw new Error('Attempt not found');

    const moduleAttempt = attempt.moduleAttempts.find(ma => ma.moduleId === moduleId);
    if (!moduleAttempt) throw new Error('Module attempt not found');
    
    // Validate that the module belongs to this mock drive
    if (moduleAttempt.module.mockDriveId !== attempt.mockDriveId) {
      throw new Error('Module does not belong to this mock drive');
    }
    
    if (moduleAttempt.status === MockDriveModuleAttemptStatus.COMPLETED) {
      throw new Error('Module already completed');
    }

    if (moduleAttempt.status === MockDriveModuleAttemptStatus.LOCKED) {
      throw new Error('Module is locked. Complete previous modules first.');
    }

    // If already has session, just return it
    if (moduleAttempt.moduleData && (moduleAttempt.moduleData as any).sessionId) {
      const sessionId = (moduleAttempt.moduleData as any).sessionId;
      return {
        moduleAttempt,
        redirectUrl: this.getMockDriveModuleRedirectUrl({
          mockDriveId: attempt.mockDriveId,
          attemptId,
          moduleId,
          moduleType: moduleAttempt.module.moduleType,
          sessionId,
          moduleAttemptId: moduleAttempt.id,
        })
      };
    }

    // CREATE SUB-SESSION
    let sessionId = '';
    const config = moduleAttempt.module.config as any;

    if (moduleAttempt.module.moduleType === MockDriveModuleType.APTITUDE) {
      sessionId = await this.createAptitudeSubSession(userId, {
        timeLimit: moduleAttempt.module.timeLimit,
        config: moduleAttempt.module.config as Prisma.JsonValue,
      });
    } else if (moduleAttempt.module.moduleType === MockDriveModuleType.MACHINE_CODING) {
      sessionId = await this.createMachineSubSession(userId, {
        timeLimit: moduleAttempt.module.timeLimit,
        config: moduleAttempt.module.config as Prisma.JsonValue,
      });
    } else if (moduleAttempt.module.moduleType === MockDriveModuleType.AI_INTERVIEW) {
      const session = await prisma.aiInterviewSession.create({
        data: {
          userId,
          jobTitle: config.jobTitle,
          companyName: config.companyName,
          difficulty: config.difficulty,
          focusAreas: config.focusAreas,
          totalQuestions: config.targetQuestions,
          status: 'CREATED'
        }
      });
      sessionId = session.id;
    }

    const updated = await prisma.individualMockDriveModuleAttempt.update({
      where: { id: moduleAttempt.id },
      data: {
        status: MockDriveModuleAttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + moduleAttempt.module.timeLimit * 60 * 1000),
        moduleData: { sessionId } as any
      }
    });

    return {
      moduleAttempt: updated,
      redirectUrl: this.getMockDriveModuleRedirectUrl({
        mockDriveId: attempt.mockDriveId,
        attemptId,
        moduleId,
        moduleType: moduleAttempt.module.moduleType,
        sessionId,
        moduleAttemptId: moduleAttempt.id,
      })
    };
  }

  /**
   * Sync and check progress
   */
  async syncAttempt(userId: string) {
    const attempt = await this.getCurrentAttempt(userId);
    if (!attempt) return null;

    let changed = false;
    let completedAttemptId: string | null = null;

    for (const ma of attempt.moduleAttempts) {
      if (ma.status === MockDriveModuleAttemptStatus.IN_PROGRESS) {
        const sessionId = (ma.moduleData as any)?.sessionId;
        if (!sessionId) continue;

        let completed = false;
        let score = 0;
        let maxScore = 0;
        let percentage = 0;

        if (ma.module.moduleType === MockDriveModuleType.APTITUDE) {
          const session = await prisma.aptitudePracticeSession.findUnique({ where: { id: sessionId } });
          if (session?.completedAt) {
            completed = true;
            score = session.totalScore || 0;
            maxScore = session.numberOfQuestions || 0;
            percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
          }
        } else if (ma.module.moduleType === MockDriveModuleType.MACHINE_CODING) {
          const session = await prisma.machinePracticeSession.findUnique({ where: { id: sessionId } });
          if (session?.completedAt) {
            completed = true;
            score = session.totalSolved || 0;
            maxScore = session.numberOfQuestions || 0;
            percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
          }
        } else if (ma.module.moduleType === MockDriveModuleType.AI_INTERVIEW) {
          const session = await prisma.aiInterviewSession.findUnique({ where: { id: sessionId }, include: { feedback: true } });
          if (session?.status === 'COMPLETED' && session.feedback) {
            completed = true;
            // Normalize feedback score to 0-100 scale
            percentage = Number(session.feedback.overallScore);
            if (percentage <= 10) percentage *= 10; // If out of 10, scale to 100
            
            score = percentage;
            maxScore = 100;
          }
        }

        if (completed) {
          await prisma.individualMockDriveModuleAttempt.update({
            where: { id: ma.id },
            data: {
              status: MockDriveModuleAttemptStatus.COMPLETED,
              completedAt: new Date(),
              score,
              maxScore,
              percentage
            }
          });

          // Unlock next module (if not last)
          const nextOrder = ma.module.order + 1;
          const nextModule = attempt.moduleAttempts.find(a => a.module.order === nextOrder);
          if (nextModule) {
            await prisma.individualMockDriveModuleAttempt.update({
              where: { id: nextModule.id },
              data: { status: MockDriveModuleAttemptStatus.AVAILABLE }
            });
          }

          changed = true;
        }
      }
    }

    if (changed) {
      // Re-fetch attempt to get fresh data
      const updatedAttempt = await this.getCurrentAttempt(userId);
      if (!updatedAttempt) return null;

      // Check if all modules are completed
      const allCompleted = updatedAttempt.moduleAttempts.every(ama => 
        ama.status === MockDriveModuleAttemptStatus.COMPLETED
      );

      if (allCompleted) {
        // Calculate total score for the attempt
        const totalPercentage = updatedAttempt.moduleAttempts.reduce((acc, ama) => {
          return acc + (ama.percentage || 0);
        }, 0) / (updatedAttempt.moduleAttempts.length || 1);

        await prisma.individualMockDriveAttempt.update({
          where: { id: updatedAttempt.id },
          data: {
            status: MockDriveAttemptStatus.COMPLETED,
            completedAt: new Date(),
            totalScore: totalPercentage
          }
        });

        completedAttemptId = updatedAttempt.id;
      }

      if (completedAttemptId) {
        return await this.getAttemptById(completedAttemptId, userId);
      }
      return await this.getCurrentAttempt(userId);
    }
    return attempt;
  }

  /**
   * Get attempt history
   */
  async getAttemptHistory(userId: string): Promise<IndividualMockDriveAttemptListItem[]> {
    const attempts = await prisma.individualMockDriveAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        mockDrive: {
          select: {
            title: true,
            _count: { select: { modules: true } }
          }
        },
        moduleAttempts: {
          include: {
            module: {
              select: {
                order: true,
                name: true,
                moduleType: true,
              }
            }
          }
        }
      }
    });

    return attempts as unknown as IndividualMockDriveAttemptListItem[];
  }
}

export const individualMockDriveService = new IndividualMockDriveService();
