"use strict";
// src/modules/instituteadmin/mock-drive/batch/batch.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchHasAttemptsError = exports.BatchScheduleConflictError = exports.BatchStatusError = exports.BatchCapacityExceededError = exports.BatchNotFoundError = exports.BatchError = void 0;
// ============================================
// Error Classes
// ============================================
class BatchError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'BatchError';
    }
}
exports.BatchError = BatchError;
class BatchNotFoundError extends BatchError {
    constructor(batchId) {
        super('BATCH_NOT_FOUND', `Batch not found: ${batchId}`, 404);
    }
}
exports.BatchNotFoundError = BatchNotFoundError;
class BatchCapacityExceededError extends BatchError {
    constructor(batchId, capacity) {
        super('BATCH_CAPACITY_EXCEEDED', `Batch capacity exceeded. Maximum: ${capacity}`, 400);
    }
}
exports.BatchCapacityExceededError = BatchCapacityExceededError;
class BatchStatusError extends BatchError {
    constructor(status, action) {
        super('BATCH_INVALID_STATUS', `Cannot ${action} batch with status: ${status}`, 400);
    }
}
exports.BatchStatusError = BatchStatusError;
class BatchScheduleConflictError extends BatchError {
    constructor(message) {
        super('BATCH_SCHEDULE_CONFLICT', message, 400);
    }
}
exports.BatchScheduleConflictError = BatchScheduleConflictError;
class BatchHasAttemptsError extends BatchError {
    constructor() {
        super('BATCH_HAS_ATTEMPTS', 'Cannot modify batch with existing attempts', 400);
    }
}
exports.BatchHasAttemptsError = BatchHasAttemptsError;
//# sourceMappingURL=batch.types.js.map