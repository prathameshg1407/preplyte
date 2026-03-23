// src/module/mock-drive/utils/scoring.utils.ts

import { MockDriveModuleType } from '@prisma/client';
import {
  AptitudeModuleData,
  MachineModuleData,
  AiInterviewModuleData,
  AptitudeModuleConfig,
  MachineModuleConfig,
  AiInterviewModuleConfig,
  ModuleData,
  ModuleConfig,
} from '../shared';

export function calculateAptitudeScore(
  data: AptitudeModuleData,
  config: AptitudeModuleConfig
): { score: number; maxScore: number; percentage: number } {
  const { marksPerQuestion, negativeMarking } = config;
  
  let correct = 0;
  let wrong = 0;
  
  for (const q of data.questions) {
    if (q.isCorrect === true) correct++;
    else if (q.isCorrect === false) wrong++;
  }
  
  const positiveMarks = correct * marksPerQuestion;
  const negativeMarks = wrong * negativeMarking;
  const score = Math.max(0, positiveMarks - negativeMarks);
  const maxScore = data.questions.length * marksPerQuestion;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  return { score, maxScore, percentage };
}

export function calculateMachineScore(
  data: MachineModuleData,
  config: MachineModuleConfig
): { score: number; maxScore: number; percentage: number } {
  const { maxScorePerQuestion, partialScoring } = config;
  
  let totalScore = 0;
  
  for (const q of data.questions) {
    if (q.isSolved) {
      totalScore += maxScorePerQuestion;
    } else if (partialScoring && q.bestScore > 0) {
      // Partial score based on test cases passed
      totalScore += q.bestScore;
    }
  }
  
  const maxScore = data.questions.length * maxScorePerQuestion;
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  
  return { score: totalScore, maxScore, percentage };
}

export function calculateInterviewScore(
  data: AiInterviewModuleData
): { score: number; maxScore: number; percentage: number } {
  const maxScore = 100; // AI Interview is scored out of 100
  
  // Handle undefined summary
  const score = data.summary?.overallScore ?? 0;
  const percentage = (score / maxScore) * 100;
  
  return { score, maxScore, percentage };
}

export function calculateModuleScore(
  moduleType: MockDriveModuleType,
  data: ModuleData,
  config: ModuleConfig
): { score: number; maxScore: number; percentage: number } {
  switch (moduleType) {
    case 'APTITUDE':
      return calculateAptitudeScore(
        data as AptitudeModuleData,
        config as AptitudeModuleConfig
      );
    case 'MACHINE_CODING':
      return calculateMachineScore(
        data as MachineModuleData,
        config as MachineModuleConfig
      );
    case 'AI_INTERVIEW':
      return calculateInterviewScore(data as AiInterviewModuleData);
    default:
      throw new Error(`Unknown module type: ${moduleType}`);
  }
}

export function calculateOverallScore(
  moduleScores: Array<{
    score: number;
    maxScore: number;
    weightage: number;
  }>
): { totalScore: number; percentageScore: number } {
  let weightedScore = 0;
  let totalWeightage = 0;
  
  for (const m of moduleScores) {
    const percentage = m.maxScore > 0 ? (m.score / m.maxScore) * 100 : 0;
    weightedScore += percentage * m.weightage;
    totalWeightage += m.weightage;
  }
  
  const percentageScore = totalWeightage > 0 ? weightedScore / totalWeightage : 0;
  
  return {
    totalScore: percentageScore,
    percentageScore,
  };
}