"use strict";
// src/module/mock-drive/utils/scoring.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAptitudeScore = calculateAptitudeScore;
exports.calculateMachineScore = calculateMachineScore;
exports.calculateInterviewScore = calculateInterviewScore;
exports.calculateModuleScore = calculateModuleScore;
exports.calculateOverallScore = calculateOverallScore;
function calculateAptitudeScore(data, config) {
    const { marksPerQuestion, negativeMarking } = config;
    let correct = 0;
    let wrong = 0;
    for (const q of data.questions) {
        if (q.isCorrect === true)
            correct++;
        else if (q.isCorrect === false)
            wrong++;
    }
    const positiveMarks = correct * marksPerQuestion;
    const negativeMarks = wrong * negativeMarking;
    const score = Math.max(0, positiveMarks - negativeMarks);
    const maxScore = data.questions.length * marksPerQuestion;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    return { score, maxScore, percentage };
}
function calculateMachineScore(data, config) {
    const { maxScorePerQuestion, partialScoring } = config;
    let totalScore = 0;
    for (const q of data.questions) {
        if (q.isSolved) {
            totalScore += maxScorePerQuestion;
        }
        else if (partialScoring && q.bestScore > 0) {
            // Partial score based on test cases passed
            totalScore += q.bestScore;
        }
    }
    const maxScore = data.questions.length * maxScorePerQuestion;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    return { score: totalScore, maxScore, percentage };
}
function calculateInterviewScore(data) {
    const maxScore = 100; // AI Interview is scored out of 100
    // Handle undefined summary
    const score = data.summary?.overallScore ?? 0;
    const percentage = (score / maxScore) * 100;
    return { score, maxScore, percentage };
}
function calculateModuleScore(moduleType, data, config) {
    switch (moduleType) {
        case 'APTITUDE':
            return calculateAptitudeScore(data, config);
        case 'MACHINE_CODING':
            return calculateMachineScore(data, config);
        case 'AI_INTERVIEW':
            return calculateInterviewScore(data);
        default:
            throw new Error(`Unknown module type: ${moduleType}`);
    }
}
function calculateOverallScore(moduleScores) {
    let weightedScore = 0;
    let totalWeightage = 0;
    for (const m of moduleScores) {
        const percentage = m.maxScore > 0 ? (m.score / m.maxScore) * 100 : 0;
        weightedScore += percentage * m.weightage;
        totalWeightage += m.weightage;
    }
    const percentageScore = totalWeightage > 0 ? weightedScore / totalWeightage : 0;
    return {
        totalScore: weightedScore,
        percentageScore,
    };
}
//# sourceMappingURL=scoring.utils.js.map