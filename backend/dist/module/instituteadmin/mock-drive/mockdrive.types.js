"use strict";
// src/modules/instituteadmin/mock-drive/mockdrive.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDriveValidationError = exports.MockDrivePublishError = exports.MockDriveInvalidStatusError = exports.MockDriveAccessDeniedError = exports.MockDriveNotFoundError = exports.MockDriveError = void 0;
const common_types_1 = require("./common/common.types");
// ============================================
// Error Classes
// ============================================
class MockDriveError extends common_types_1.BaseError {
    constructor(message, code = 'MOCK_DRIVE_ERROR', statusCode = 400) {
        super(code, message, statusCode);
    }
}
exports.MockDriveError = MockDriveError;
class MockDriveNotFoundError extends MockDriveError {
    constructor(mockDriveId) {
        super(`Mock drive with ID ${mockDriveId} not found`, 'MOCK_DRIVE_NOT_FOUND', 404);
    }
}
exports.MockDriveNotFoundError = MockDriveNotFoundError;
class MockDriveAccessDeniedError extends MockDriveError {
    constructor() {
        super('You do not have access to this mock drive', 'ACCESS_DENIED', 403);
    }
}
exports.MockDriveAccessDeniedError = MockDriveAccessDeniedError;
class MockDriveInvalidStatusError extends MockDriveError {
    constructor(currentStatus, action) {
        super(`Cannot ${action} mock drive with status: ${currentStatus}`, 'INVALID_STATUS', 400);
    }
}
exports.MockDriveInvalidStatusError = MockDriveInvalidStatusError;
class MockDrivePublishError extends MockDriveError {
    constructor(reason) {
        super(`Cannot publish mock drive: ${reason}`, 'PUBLISH_ERROR', 400);
    }
}
exports.MockDrivePublishError = MockDrivePublishError;
class MockDriveValidationError extends MockDriveError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}
exports.MockDriveValidationError = MockDriveValidationError;
//# sourceMappingURL=mockdrive.types.js.map