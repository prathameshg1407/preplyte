export declare class ConfigService {
    /**
     * Get time limit configuration
     */
    getTimeLimits(): {
        aptitude: {
            minTimeLimit: number;
            maxTimeLimit: number;
            defaultTimeLimit: number;
            timeLimitUnit: string;
            recommendedTimeLimits: {
                EASY: {
                    min: number;
                    max: number;
                    recommended: number;
                };
                MEDIUM: {
                    min: number;
                    max: number;
                    recommended: number;
                };
                HARD: {
                    min: number;
                    max: number;
                    recommended: number;
                };
            };
        };
        machine: {
            minTimeLimit: number;
            maxTimeLimit: number;
            defaultTimeLimit: number;
            timeLimitUnit: string;
            recommendedTimeLimits: {
                EASY: {
                    min: number;
                    max: number;
                    recommended: number;
                };
                MEDIUM: {
                    min: number;
                    max: number;
                    recommended: number;
                };
                HARD: {
                    min: number;
                    max: number;
                    recommended: number;
                };
            };
        };
        codeExecution: {
            perTestCaseTimeLimit: number;
            perTestCaseMemoryLimit: number;
            timeUnit: string;
            memoryUnit: string;
        };
        questionLimits: {
            aptitude: {
                min: number;
                max: number;
                default: number;
            };
            machine: {
                min: number;
                max: number;
                default: number;
            };
        };
    };
}
export declare const configService: ConfigService;
//# sourceMappingURL=config.service.d.ts.map