"use strict";
// src/modules/instituteadmin/mock-drive/eligibility/eligibility.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EligibilityValidationError = exports.EligibilityNotFoundError = exports.EligibilityError = void 0;
// ============================================
// Error Classes
// ============================================
class EligibilityError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'EligibilityError';
    }
}
exports.EligibilityError = EligibilityError;
class EligibilityNotFoundError extends EligibilityError {
    constructor(mockDriveId) {
        super('ELIGIBILITY_NOT_FOUND', `Eligibility criteria not found for mock drive: ${mockDriveId}`, 404);
    }
}
exports.EligibilityNotFoundError = EligibilityNotFoundError;
class EligibilityValidationError extends EligibilityError {
    constructor(message) {
        super('ELIGIBILITY_VALIDATION_ERROR', message, 400);
    }
}
exports.EligibilityValidationError = EligibilityValidationError;
//# sourceMappingURL=eligibility.types.js.map