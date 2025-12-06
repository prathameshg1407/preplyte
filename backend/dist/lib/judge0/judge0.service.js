"use strict";
// src/lib/judge0/judge0.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.judge0Service = exports.Judge0Service = void 0;
const judge0_client_1 = require("./judge0.client");
const judge0_types_1 = require("./judge0.types");
const judge0_languages_1 = require("./judge0.languages");
class Judge0Service {
    client;
    constructor(config = {}) {
        this.client = new judge0_client_1.Judge0Client(config);
    }
    // ---------------------------------------------------
    // DELEGATED METHODS (from Judge0Client)
    // ---------------------------------------------------
    testConnection = () => this.client.testConnection();
    /** Create a single submission and get token */
    createSubmission = (submission) => this.client.createSubmission(submission);
    /** Get submission result by token */
    getSubmission = (token) => this.client.getSubmission(token);
    /** Wait for a single submission result */
    waitForResult = (token) => this.client.waitForResult(token);
    /** Create batch submissions and get tokens */
    createBatchSubmission = (submissions) => this.client.createBatchSubmission(submissions);
    /** Get batch submission results by tokens */
    getBatchSubmission = (tokens) => this.client.getBatchSubmission(tokens);
    /** Wait for all batch results */
    waitForBatchResults = (tokens) => this.client.waitForBatchResults(tokens);
    // ---------------------------------------------------
    // STATIC HELPERS
    // ---------------------------------------------------
    getLanguageId = judge0_languages_1.getLanguageId;
    getSupportedLanguages = judge0_languages_1.getSupportedLanguages;
    mapStatusToSubmissionStatus = judge0_types_1.mapJudge0StatusToSubmissionStatus;
    // ---------------------------------------------------
    // CODE EXECUTION (High-level)
    // ---------------------------------------------------
    async executeCode(request) {
        const languageId = (0, judge0_languages_1.getLanguageId)(request.language);
        const submission = {
            source_code: request.code,
            language_id: languageId,
            stdin: request.stdin || '',
            expected_output: request.expectedOutput,
            cpu_time_limit: request.timeLimit || 5,
            memory_limit: request.memoryLimit || 128000,
        };
        try {
            const token = await this.client.createSubmission(submission);
            const result = await this.client.waitForResult(token);
            return this.parseResult(result, request.expectedOutput);
        }
        catch (error) {
            return {
                success: false,
                status: 'ERROR',
                statusId: -1,
                stdout: null,
                stderr: null,
                compileOutput: null,
                executionTime: '0',
                memoryUsed: 0,
                isCorrect: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async runCode(code, language, stdin) {
        return this.executeCode({ code, language, stdin });
    }
    // ---------------------------------------------------
    // TEST CASE EXECUTION
    // ---------------------------------------------------
    async executeWithTestCase(code, language, testCaseId, input, expectedOutput, timeLimit) {
        const result = await this.executeCode({
            code,
            language,
            stdin: input,
            expectedOutput,
            timeLimit,
        });
        const actualOutput = result.stdout?.trim() || '';
        const expected = expectedOutput.trim();
        const isCorrect = result.statusId === judge0_types_1.Judge0StatusId.ACCEPTED ||
            this.compareOutputs(actualOutput, expected);
        return {
            testCaseId,
            input,
            expectedOutput: expected,
            actualOutput,
            isCorrect,
            status: result.status,
            statusId: result.statusId,
            executionTime: result.executionTime,
            memoryUsed: result.memoryUsed,
            error: result.stderr || result.compileOutput || result.error || undefined,
        };
    }
    // ---------------------------------------------------
    // BATCH EXECUTION
    // ---------------------------------------------------
    async executeBatch(code, language, questionId, testCases, timeLimit) {
        const results = [];
        let passedCount = 0;
        let hasError = false;
        let totalTime = 0;
        let totalMemory = 0;
        for (const testCase of testCases) {
            const result = await this.executeWithTestCase(code, language, testCase.id, testCase.input, testCase.expectedOutput, timeLimit);
            results.push(result);
            if (result.isCorrect)
                passedCount++;
            if (result.error)
                hasError = true;
            totalTime += parseFloat(result.executionTime) || 0;
            totalMemory += result.memoryUsed || 0;
        }
        const failedCount = testCases.length - passedCount;
        let overallStatus;
        if (passedCount === testCases.length)
            overallStatus = 'PASSED';
        else if (passedCount > 0)
            overallStatus = 'PARTIALLY_PASSED';
        else if (hasError)
            overallStatus = 'ERROR';
        else
            overallStatus = 'FAILED';
        return {
            questionId,
            totalTestCases: testCases.length,
            passedTestCases: passedCount,
            failedTestCases: failedCount,
            results,
            overallStatus,
            totalExecutionTime: totalTime,
            averageMemory: testCases.length > 0 ? totalMemory / testCases.length : 0,
        };
    }
    // ---------------------------------------------------
    // UTILITIES
    // ---------------------------------------------------
    parseResult(result, expectedOutput) {
        const isAccepted = result.status.id === judge0_types_1.Judge0StatusId.ACCEPTED;
        const actualOutput = result.stdout?.trim() || '';
        const expected = expectedOutput?.trim() || '';
        return {
            success: isAccepted || (expectedOutput ? this.compareOutputs(actualOutput, expected) : true),
            status: result.status.description,
            statusId: result.status.id,
            stdout: result.stdout,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            executionTime: result.time || '0',
            memoryUsed: result.memory || 0,
            isCorrect: isAccepted || this.compareOutputs(actualOutput, expected),
        };
    }
    compareOutputs(actual, expected) {
        const normalize = (s) => s.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).join('\n');
        return normalize(actual) === normalize(expected);
    }
}
exports.Judge0Service = Judge0Service;
// Singleton export
exports.judge0Service = new Judge0Service();
//# sourceMappingURL=judge0.service.js.map