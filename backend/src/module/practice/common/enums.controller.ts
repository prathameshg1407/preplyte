import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../lib/db';
import { sendSuccess } from '../../../utils/response';

export class EnumsController {
  /**
   * GET /api/enums/difficulty-levels
   */
  async getDifficultyLevels(_req: Request, res: Response, next: NextFunction) {
    try {
      const difficultyLevels = [
        {
          value: 'EASY',
          label: 'Easy',
          description: 'Beginner-friendly questions',
          color: '#22c55e',
          aptitudeTimeMultiplier: 1.0,
          machineTimeMultiplier: 1.0,
        },
        {
          value: 'MEDIUM',
          label: 'Medium',
          description: 'Intermediate level questions',
          color: '#f59e0b',
          aptitudeTimeMultiplier: 1.5,
          machineTimeMultiplier: 1.5,
        },
        {
          value: 'HARD',
          label: 'Hard',
          description: 'Advanced challenging questions',
          color: '#ef4444',
          aptitudeTimeMultiplier: 2.0,
          machineTimeMultiplier: 2.0,
        },
      ];

      sendSuccess(res, { difficultyLevels });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/enums/question-types
   */
  async getQuestionTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const aptitudeQuestionTypes = [
        {
          value: 'QUANTITATIVE',
          label: 'Quantitative Aptitude',
          description: 'Mathematical and numerical reasoning questions',
          icon: 'calculator',
          topics: [
            'Arithmetic',
            'Algebra',
            'Percentages',
            'Ratios',
            'Time & Work',
            'Speed & Distance',
            'Profit & Loss',
          ],
        },
        {
          value: 'VERBAL',
          label: 'Verbal Ability',
          description: 'English language and comprehension questions',
          icon: 'book-open',
          topics: [
            'Synonyms',
            'Antonyms',
            'Analogies',
            'Reading Comprehension',
            'Sentence Correction',
            'Vocabulary',
          ],
        },
        {
          value: 'LOGICAL',
          label: 'Logical Reasoning',
          description: 'Pattern recognition and logical thinking questions',
          icon: 'puzzle',
          topics: [
            'Series',
            'Coding-Decoding',
            'Blood Relations',
            'Syllogisms',
            'Seating Arrangement',
            'Puzzles',
          ],
        },
      ];

      // Get machine question tags with counts
      const tagCounts = await prisma.machineQuestion.groupBy({
        by: ['tags'],
        where: { isActive: true },
      });

      const tagCountMap: Record<string, number> = {};
      tagCounts.forEach((item) => {
        item.tags.forEach((tag) => {
          tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
        });
      });

      const machineQuestionTags = Object.entries(tagCountMap)
        .map(([value, count]) => ({
          value,
          label: value
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          count,
        }))
        .sort((a, b) => b.count - a.count);

      const submissionStatuses = [
        {
          value: 'PENDING',
          label: 'Pending',
          description: 'Submission is being processed',
          color: '#6b7280',
        },
        {
          value: 'ACCEPTED',
          label: 'Accepted',
          description: 'All test cases passed',
          color: '#22c55e',
        },
        {
          value: 'WRONG_ANSWER',
          label: 'Wrong Answer',
          description: "Output doesn't match expected result",
          color: '#ef4444',
        },
        {
          value: 'TIME_LIMIT_EXCEEDED',
          label: 'Time Limit Exceeded',
          description: 'Solution took too long to execute',
          color: '#f59e0b',
        },
        {
          value: 'MEMORY_LIMIT_EXCEEDED',
          label: 'Memory Limit Exceeded',
          description: 'Solution used too much memory',
          color: '#8b5cf6',
        },
        {
          value: 'RUNTIME_ERROR',
          label: 'Runtime Error',
          description: 'Solution crashed during execution',
          color: '#ec4899',
        },
        {
          value: 'COMPILATION_ERROR',
          label: 'Compilation Error',
          description: 'Code failed to compile',
          color: '#64748b',
        },
      ];

      sendSuccess(res, {
        aptitudeQuestionTypes,
        machineQuestionTags,
        submissionStatuses,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/practice/enums/ai-interview-difficulties
   */
  async getAiInterviewDifficulties(_req: Request, res: Response, next: NextFunction) {
    try {
      const difficulties = [
        {
          value: 'ENTRY',
          label: 'Entry Level',
          description: 'For freshers and entry-level positions',
          color: '#22c55e',
        },
        {
          value: 'MID',
          label: 'Mid Level',
          description: 'For 2-5 years of experience',
          color: '#f59e0b',
        },
        {
          value: 'SENIOR',
          label: 'Senior Level',
          description: 'For 5+ years of experience',
          color: '#ef4444',
        },
        {
          value: 'LEAD',
          label: 'Lead Level',
          description: 'For leadership and architect roles',
          color: '#8b5cf6',
        },
      ];

      sendSuccess(res, { difficulties });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/practice/enums/module-types
   */
  async getModuleTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const moduleTypes = [
        {
          value: 'APTITUDE',
          label: 'Aptitude Test',
          description: 'Quantitative, verbal, and logical reasoning questions',
          icon: 'brain',
        },
        {
          value: 'MACHINE_CODING',
          label: 'Machine Coding',
          description: 'Programming and algorithm questions',
          icon: 'code',
        },
        {
          value: 'AI_INTERVIEW',
          label: 'AI Interview',
          description: 'AI-powered behavioral and technical interview',
          icon: 'mic',
        },
      ];

      sendSuccess(res, { moduleTypes });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/practice/enums/mock-drive-statuses
   */
  async getMockDriveStatuses(_req: Request, res: Response, next: NextFunction) {
    try {
      const statuses = [
        {
          value: 'DRAFT',
          label: 'Draft',
          description: 'Mock drive is being created',
          color: '#6b7280',
        },
        {
          value: 'PUBLISHED',
          label: 'Published',
          description: 'Mock drive is published but registration not open',
          color: '#3b82f6',
        },
        {
          value: 'REGISTRATION_OPEN',
          label: 'Registration Open',
          description: 'Students can register for the mock drive',
          color: '#22c55e',
        },
        {
          value: 'REGISTRATION_CLOSED',
          label: 'Registration Closed',
          description: 'Registration period has ended',
          color: '#f59e0b',
        },
        {
          value: 'IN_PROGRESS',
          label: 'In Progress',
          description: 'Mock drive is currently active',
          color: '#8b5cf6',
        },
        {
          value: 'COMPLETED',
          label: 'Completed',
          description: 'Mock drive has finished',
          color: '#10b981',
        },
        {
          value: 'CANCELLED',
          label: 'Cancelled',
          description: 'Mock drive was cancelled',
          color: '#ef4444',
        },
      ];

      sendSuccess(res, { statuses });
    } catch (error) {
      next(error);
    }
  }
}

export const enumsController = new EnumsController();