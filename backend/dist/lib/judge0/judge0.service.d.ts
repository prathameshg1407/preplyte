import { Judge0Submission, Judge0Result, Judge0Config, CodeExecutionRequest, CodeExecutionResult, TestCaseExecutionResult, BatchExecutionResult } from './judge0.types';
export declare class Judge0Service {
    private client;
    constructor(config?: Judge0Config);
    testConnection: () => Promise<boolean>;
    /** Create a single submission and get token */
    createSubmission: (submission: Judge0Submission) => Promise<string>;
    /** Get submission result by token */
    getSubmission: (token: string) => Promise<Judge0Result>;
    /** Wait for a single submission result */
    waitForResult: (token: string) => Promise<Judge0Result>;
    /** Create batch submissions and get tokens */
    createBatchSubmission: (submissions: Judge0Submission[]) => Promise<string[]>;
    /** Get batch submission results by tokens */
    getBatchSubmission: (tokens: string[]) => Promise<Judge0Result[]>;
    /** Wait for all batch results */
    waitForBatchResults: (tokens: string[]) => Promise<Judge0Result[]>;
    getLanguageId: (language: string) => number;
    getSupportedLanguages: () => import("./judge0.languages").LanguageConfig[];
    mapStatusToSubmissionStatus: (statusId: number) => import("./judge0.types").SubmissionStatus;
    executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult>;
    runCode(code: string, language: string, stdin?: string): Promise<CodeExecutionResult>;
    executeWithTestCase(code: string, language: string, testCaseId: string, input: string, expectedOutput: string, timeLimit?: number): Promise<TestCaseExecutionResult>;
    executeBatch(code: string, language: string, questionId: string, testCases: {
        id: string;
        input: string;
        expectedOutput: string;
    }[], timeLimit?: number): Promise<BatchExecutionResult>;
    private parseResult;
    private compareOutputs;
}
export declare const judge0Service: Judge0Service;
//# sourceMappingURL=judge0.service.d.ts.map