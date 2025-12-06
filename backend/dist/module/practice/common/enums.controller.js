"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumsController = exports.EnumsController = void 0;
const db_1 = require("../../../lib/db");
const response_1 = require("../../../utils/response");
class EnumsController {
    /**
     * GET /api/enums/difficulty-levels
     */
    async getDifficultyLevels(_req, res, next) {
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
            (0, response_1.sendSuccess)(res, { difficultyLevels });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/enums/question-types
     */
    async getQuestionTypes(_req, res, next) {
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
            const tagCounts = await db_1.prisma.machineQuestion.groupBy({
                by: ['tags'],
                where: { isActive: true },
            });
            const tagCountMap = {};
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
            (0, response_1.sendSuccess)(res, {
                aptitudeQuestionTypes,
                machineQuestionTags,
                submissionStatuses,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EnumsController = EnumsController;
exports.enumsController = new EnumsController();
//# sourceMappingURL=enums.controller.js.map