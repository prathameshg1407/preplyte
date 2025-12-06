"use strict";
// src/modules/instituteadmin/mock-drive/results/results.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultNotFoundError = exports.AccessDeniedError = exports.MockDriveNotFoundError = exports.ResultsError = void 0;
// ============================================
// Errors
// ============================================
class ResultsError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'ResultsError';
    }
}
exports.ResultsError = ResultsError;
class MockDriveNotFoundError extends ResultsError {
    constructor(id) {
        super('MOCK_DRIVE_NOT_FOUND', `Mock drive not found: ${id}`, 404);
    }
}
exports.MockDriveNotFoundError = MockDriveNotFoundError;
class AccessDeniedError extends ResultsError {
    constructor() {
        super('ACCESS_DENIED', 'You do not have access to this mock drive', 403);
    }
}
exports.AccessDeniedError = AccessDeniedError;
class ResultNotFoundError extends ResultsError {
    constructor(attemptId) {
        super('RESULT_NOT_FOUND', `Result not found: ${attemptId}`, 404);
    }
}
exports.ResultNotFoundError = ResultNotFoundError;
//# sourceMappingURL=results.types.js.map