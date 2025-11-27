// src/module/mock-drive/results/results.service.ts

import { PrismaClient } from '@prisma/client';
import {
  NotFoundError,
  BadRequestError,
} from '../../../utils/errors';
import {
  ResultOverview,
  DetailedReport,
  ModuleReport,
  ComparisonStats,
  AptitudeAnalysis,
  MachineAnalysis,
  InterviewAnalysis,
} from './results.types';
import {
  AptitudeModuleData,
  MachineModuleData,
  AiInterviewModuleData,
} from '../shared';

export class ResultsService {
  constructor(private prisma: PrismaClient) {}

  async getResultOverview(userId: string, driveId: string): Promise<ResultOverview> {
    const attempt = await this.prisma.mockDriveAttempt.findFirst({
      where: {
        mockDriveId: driveId,
        userId,
      },
      include: {
        mockDrive: {
          select: { id: true, title: true },
        },
        moduleAttempts: {
          include: { module: true },
          orderBy: { module: { order: 'asc' } },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundError('No attempt found for this mock drive');
    }

    if (attempt.status !== 'COMPLETED' && attempt.status !== 'TIMED_OUT') {
      throw new BadRequestError('Results are not available yet. Complete the mock drive first.');
    }

    // Get total participants
    const totalParticipants = await this.prisma.mockDriveAttempt.count({
      where: {
        mockDriveId: driveId,
        status: { in: ['COMPLETED', 'TIMED_OUT'] },
      },
    });

    // Get rank
    const leaderboardEntry = await this.prisma.mockDriveLeaderboard.findFirst({
      where: {
        mockDriveId: driveId,
        userId,
        batchId: attempt.batchId,
      },
    });

    // Calculate if passed (all modules passed or overall score above threshold)
    const isPassed = attempt.moduleAttempts.every((ma) => ma.isPassed !== false);

    const moduleScores = attempt.moduleAttempts.map((ma) => ({
      moduleId: ma.moduleId,
      moduleName: ma.module.name,
      moduleType: ma.module.moduleType,
      order: ma.module.order,
      score: ma.score || 0,
      maxScore: ma.maxScore || 0,
      percentage: ma.percentage || 0,
      isPassed: ma.isPassed || false,
      timeSpentSeconds: ma.timeSpentSeconds,
      status: ma.status,
    }));

    return {
      attemptId: attempt.id,
      mockDriveId: attempt.mockDriveId,
      mockDriveTitle: attempt.mockDrive.title,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      totalScore: attempt.totalScore,
      percentageScore: attempt.percentageScore,
      rank: leaderboardEntry?.rank || null,
      totalParticipants,
      isPassed,
      moduleScores,
    };
  }

  async getDetailedReport(userId: string, driveId: string): Promise<DetailedReport> {
    const overview = await this.getResultOverview(userId, driveId);

    // Get attempt with full module data
    const attempt = await this.prisma.mockDriveAttempt.findFirst({
      where: {
        mockDriveId: driveId,
        userId,
      },
      include: {
        moduleAttempts: {
          include: { module: true },
          orderBy: { module: { order: 'asc' } },
        },
        report: true,
      },
    });

    if (!attempt) {
      throw new NotFoundError('Attempt');
    }

    // Generate module reports
    const moduleReports: ModuleReport[] = await Promise.all(
      attempt.moduleAttempts.map(async (ma) => {
        const analysis = this.generateModuleAnalysis(ma.module.moduleType, ma.moduleData);
        const feedback = this.generateModuleFeedback(ma.module.moduleType, analysis, ma.percentage || 0);
        const recommendations = this.generateModuleRecommendations(ma.module.moduleType, analysis);

        return {
          moduleId: ma.moduleId,
          moduleName: ma.module.name,
          moduleType: ma.module.moduleType,
          score: ma.score || 0,
          maxScore: ma.maxScore || 0,
          percentage: ma.percentage || 0,
          timeSpentSeconds: ma.timeSpentSeconds,
          detailedAnalysis: analysis,
          feedback,
          recommendations,
        };
      })
    );

    // Get comparison stats
    const comparisonStats = await this.getComparisonStats(driveId, userId, attempt.batchId);

    // Generate overall recommendations
    const { recommendations, strengths, weaknesses } = this.generateOverallInsights(moduleReports);

    return {
      overview,
      moduleReports,
      recommendations,
      strengths,
      weaknesses,
      overallFeedback: this.generateOverallFeedback(overview, moduleReports),
      comparisonStats,
    };
  }

  private generateModuleAnalysis(
    moduleType: string,
    moduleData: any
  ): AptitudeAnalysis | MachineAnalysis | InterviewAnalysis | null {
    if (!moduleData) return null;

    switch (moduleType) {
      case 'APTITUDE':
        return this.generateAptitudeAnalysis(moduleData as AptitudeModuleData);
      case 'MACHINE_CODING':
        return this.generateMachineAnalysis(moduleData as MachineModuleData);
      case 'AI_INTERVIEW':
        return this.generateInterviewAnalysis(moduleData as AiInterviewModuleData);
      default:
        return null;
    }
  }

  private generateAptitudeAnalysis(data: AptitudeModuleData): AptitudeAnalysis {
    const { questions, summary } = data;

    const totalTime = questions.reduce((sum, q) => sum + q.timeSpentSeconds, 0);
    const answeredQuestions = questions.filter((q) => q.selectedOptionId !== null);
    const timeValues = questions.map((q) => q.timeSpentSeconds).filter((t) => t > 0);

    return {
      totalQuestions: summary.totalQuestions,
      correct: summary.totalCorrect,
      wrong: summary.totalWrong,
      unanswered: summary.totalUnanswered,
      accuracy: summary.totalCorrect + summary.totalWrong > 0
        ? (summary.totalCorrect / (summary.totalCorrect + summary.totalWrong)) * 100
        : 0,
      questionTypeAnalysis: [], // Would need question type data
      timeAnalysis: {
        averageTimePerQuestion: answeredQuestions.length > 0
          ? totalTime / answeredQuestions.length
          : 0,
        fastestQuestion: timeValues.length > 0 ? Math.min(...timeValues) : 0,
        slowestQuestion: timeValues.length > 0 ? Math.max(...timeValues) : 0,
      },
    };
  }

  private generateMachineAnalysis(data: MachineModuleData): MachineAnalysis {
    const { questions, summary } = data;

    const languagesUsed = new Set<string>();
    let totalSubmissions = 0;

    const questionAnalysis = questions.map((q) => {
      q.submissions.forEach((s) => {
        languagesUsed.add(s.languageName);
        totalSubmissions++;
      });

      return {
        questionId: q.machineQuestionId,
        title: '', // Would need to fetch from question
        solved: q.isSolved,
        bestScore: q.bestScore,
        maxScore: 100, // From config
        submissionCount: q.submissions.length,
      };
    });

    return {
      totalQuestions: summary.totalQuestions,
      solved: summary.totalSolved,
      partial: summary.totalPartial,
      unattempted: summary.totalUnattempted,
      totalSubmissions,
      languagesUsed: Array.from(languagesUsed),
      questionAnalysis,
    };
  }

  private generateInterviewAnalysis(data: AiInterviewModuleData): InterviewAnalysis {
    const { responses, summary } = data;

    const skipped = responses.filter((r) => r.answer === '[SKIPPED]').length;
    const technicalResponses = responses.filter((r) => r.category === 'TECHNICAL');
    const technicalScore = technicalResponses.length > 0
      ? technicalResponses.reduce((sum, r) => sum + r.scores.overall, 0) / technicalResponses.length
      : 0;

    const communicationScores = responses
      .filter((r) => r.answer !== '[SKIPPED]')
      .map((r) => r.scores.clarity);
    const communicationScore = communicationScores.length > 0
      ? communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length
      : 0;

    return {
      totalQuestions: summary.totalQuestions,
      answered: summary.questionsAnswered,
      skipped,
      overallScore: summary.overallScore,
      categoryScores: summary.categoryScores,
      communicationScore: communicationScore * 10, // Scale to 100
      technicalScore: technicalScore * 10,
      keyStrengths: summary.keyStrengths,
      areasForImprovement: summary.areasForImprovement,
    };
  }

  private generateModuleFeedback(moduleType: string, analysis: any, percentage: number): string {
    if (!analysis) return 'No detailed analysis available.';

    const performanceLevel =
      percentage >= 80
        ? 'excellent'
        : percentage >= 60
          ? 'good'
          : percentage >= 40
            ? 'average'
            : 'needs improvement';

    switch (moduleType) {
      case 'APTITUDE':
        return `Your aptitude performance was ${performanceLevel}. You answered ${analysis.correct} questions correctly out of ${analysis.totalQuestions}. ${analysis.accuracy >= 70 ? 'Your accuracy is commendable.' : 'Focus on accuracy over speed.'}`;
      case 'MACHINE_CODING':
        return `Your coding performance was ${performanceLevel}. You solved ${analysis.solved} problems completely. ${analysis.totalSubmissions > analysis.totalQuestions * 2 ? 'Good persistence in attempting multiple solutions.' : 'Consider testing your code more thoroughly before submission.'}`;
      case 'AI_INTERVIEW':
        return `Your interview performance was ${performanceLevel}. ${analysis.communicationScore >= 70 ? 'Your communication skills are strong.' : 'Work on articulating your thoughts more clearly.'} ${analysis.technicalScore >= 70 ? 'Technical knowledge is solid.' : 'Consider deepening your technical understanding.'}`;
      default:
        return `Your performance was ${performanceLevel}.`;
    }
  }

  private generateModuleRecommendations(moduleType: string, analysis: any): string[] {
    if (!analysis) return [];

    const recommendations: string[] = [];

    switch (moduleType) {
      case 'APTITUDE':
        if (analysis.accuracy < 70) {
          recommendations.push('Focus on understanding concepts rather than rushing through questions.');
        }
        if (analysis.unanswered > 0) {
          recommendations.push(`Try to attempt all questions. You left ${analysis.unanswered} questions unanswered.`);
        }
        if (analysis.timeAnalysis.averageTimePerQuestion > 120) {
          recommendations.push('Practice time management to improve speed.');
        }
        break;

      case 'MACHINE_CODING':
        if (analysis.unattempted > 0) {
          recommendations.push('Attempt all problems, even with partial solutions.');
        }
        if (analysis.partial > 0) {
          recommendations.push('Review edge cases and boundary conditions for partial solutions.');
        }
        if (analysis.languagesUsed.length === 1) {
          recommendations.push('Consider learning additional programming languages for flexibility.');
        }
        break;

      case 'AI_INTERVIEW':
        if (analysis.skipped > 0) {
          recommendations.push('Avoid skipping questions. Attempt every question to demonstrate your thought process.');
        }
        if (analysis.communicationScore < 70) {
          recommendations.push('Practice structuring your answers using STAR method.');
        }
        if (analysis.technicalScore < 70) {
          recommendations.push('Strengthen technical fundamentals and practice explaining concepts.');
        }
        break;
    }

    return recommendations;
  }

  private generateOverallInsights(moduleReports: ModuleReport[]): {
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    for (const report of moduleReports) {
      if (report.percentage >= 70) {
        strengths.push(`Strong performance in ${report.moduleName || report.moduleType}`);
      } else if (report.percentage < 50) {
        weaknesses.push(`Needs improvement in ${report.moduleName || report.moduleType}`);
      }
      recommendations.push(...report.recommendations);
    }

    // Add overall recommendations
    if (moduleReports.every((r) => r.percentage >= 60)) {
      recommendations.push('Great overall performance! Focus on consistency to achieve even better results.');
    }

    if (moduleReports.some((r) => r.percentage < 40)) {
      recommendations.push('Consider focused practice on weaker areas before the next assessment.');
    }

    return { recommendations, strengths, weaknesses };
  }

  private generateOverallFeedback(overview: ResultOverview, _moduleReports: ModuleReport[]): string {
    const avgPercentage = overview.percentageScore || 0;

    if (avgPercentage >= 80) {
      return 'Outstanding performance! You demonstrated excellent skills across all modules. Keep up the great work and continue to challenge yourself with more advanced problems.';
    } else if (avgPercentage >= 60) {
      return 'Good performance! You showed solid understanding in most areas. Focus on the weaker modules identified in your report to achieve even better results.';
    } else if (avgPercentage >= 40) {
      return 'Average performance. There is significant room for improvement. Review the module-specific feedback and dedicate focused practice time to each area.';
    } else {
      return "This assessment highlighted several areas that need attention. Don't be discouraged - use this as a learning opportunity. Focus on fundamentals and practice regularly.";
    }
  }

  private async getComparisonStats(
    driveId: string,
    userId: string,
    batchId: string | null
  ): Promise<ComparisonStats> {
    // Get batch stats
    const batchEntries = await this.prisma.mockDriveLeaderboard.findMany({
      where: { mockDriveId: driveId, batchId },
      orderBy: { percentageScore: 'desc' },
    });

    // Get overall stats
    const overallEntries = await this.prisma.mockDriveLeaderboard.findMany({
      where: { mockDriveId: driveId, batchId: null },
      orderBy: { percentageScore: 'desc' },
    });

    const userBatchEntry = batchEntries.find((e) => e.userId === userId);
    const userOverallEntry = overallEntries.find((e) => e.userId === userId);

    const scores = batchEntries.map((e) => e.percentageScore);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Calculate percentile
    const userScore = userBatchEntry?.percentageScore || 0;
    const belowCount = scores.filter((s) => s < userScore).length;
    const percentile = scores.length > 0 ? (belowCount / scores.length) * 100 : 0;

    return {
      averageScore: avgScore,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      percentile,
      rankInBatch: userBatchEntry?.rank || 0,
      totalInBatch: batchEntries.length,
      rankOverall: userOverallEntry?.rank || 0,
      totalOverall: overallEntries.length,
    };
  }
}