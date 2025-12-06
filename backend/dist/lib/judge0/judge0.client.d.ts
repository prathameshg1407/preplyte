import { Judge0Submission, Judge0Result, Judge0Config } from './judge0.types';
export declare class Judge0Client {
    private client;
    private useRapidAPI;
    private maxRetries;
    private retryDelay;
    constructor(config?: Judge0Config);
    testConnection(): Promise<boolean>;
    createSubmission(submission: Judge0Submission): Promise<string>;
    getSubmission(token: string): Promise<Judge0Result>;
    waitForResult(token: string): Promise<Judge0Result>;
    createBatchSubmission(submissions: Judge0Submission[]): Promise<string[]>;
    getBatchSubmission(tokens: string[]): Promise<Judge0Result[]>;
    waitForBatchResults(tokens: string[]): Promise<Judge0Result[]>;
    private delay;
    private formatError;
    private createError;
}
//# sourceMappingURL=judge0.client.d.ts.map