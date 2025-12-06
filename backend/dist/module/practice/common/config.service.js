"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configService = exports.ConfigService = void 0;
class ConfigService {
    /**
     * Get time limit configuration
     */
    getTimeLimits() {
        return {
            aptitude: {
                minTimeLimit: 10,
                maxTimeLimit: 120,
                defaultTimeLimit: 30,
                timeLimitUnit: 'minutes',
                recommendedTimeLimits: {
                    EASY: { min: 10, max: 30, recommended: 15 },
                    MEDIUM: { min: 20, max: 60, recommended: 30 },
                    HARD: { min: 30, max: 90, recommended: 45 },
                },
            },
            machine: {
                minTimeLimit: 30,
                maxTimeLimit: 180,
                defaultTimeLimit: 90,
                timeLimitUnit: 'minutes',
                recommendedTimeLimits: {
                    EASY: { min: 30, max: 60, recommended: 45 },
                    MEDIUM: { min: 60, max: 120, recommended: 90 },
                    HARD: { min: 90, max: 180, recommended: 120 },
                },
            },
            codeExecution: {
                perTestCaseTimeLimit: 2,
                perTestCaseMemoryLimit: 256000,
                timeUnit: 'seconds',
                memoryUnit: 'KB',
            },
            questionLimits: {
                aptitude: { min: 5, max: 50, default: 20 },
                machine: { min: 1, max: 10, default: 3 },
            },
        };
    }
}
exports.ConfigService = ConfigService;
exports.configService = new ConfigService();
//# sourceMappingURL=config.service.js.map