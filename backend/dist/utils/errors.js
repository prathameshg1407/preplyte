"use strict";
// ============================================
// Base Error Class
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionError = exports.DatabaseError = exports.AIServiceError = exports.ExternalServiceError = exports.FileTooLargeError = exports.InvalidFileTypeError = exports.FileUploadError = exports.InstituteLimitReachedError = exports.DomainNotAllowedError = exports.InstituteInactiveError = exports.AnswerAlreadySubmittedError = exports.QuestionNotInSessionError = exports.InvalidOptionError = exports.SessionAlreadyCompletedError = exports.SessionNotCompletedError = exports.SessionNotStartedError = exports.SessionInProgressError = exports.SessionExpiredError = exports.TokenRevokedError = exports.InvalidTokenError = exports.TokenExpiredError = exports.ServiceUnavailableError = exports.NotImplementedError = exports.InternalError = exports.RateLimitError = exports.UnprocessableEntityError = exports.PayloadTooLargeError = exports.InsufficientQuestionsError = exports.GoneError = exports.ConflictError = exports.MethodNotAllowedError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.BadRequestError = exports.isOperationalError = exports.isAppError = exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    details;
    isOperational;
    timestamp;
    constructor(code, message, statusCode = 400, details, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.setPrototypeOf(this, new.target.prototype);
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.AppError = AppError;
// ============================================
// Type Guard
// ============================================
const isAppError = (error) => {
    return error instanceof AppError;
};
exports.isAppError = isAppError;
const isOperationalError = (error) => {
    if ((0, exports.isAppError)(error)) {
        return error.isOperational;
    }
    return false;
};
exports.isOperationalError = isOperationalError;
// ============================================
// HTTP Error Classes (4xx)
// ============================================
class BadRequestError extends AppError {
    constructor(message = 'Bad request', details) {
        super('BAD_REQUEST', message, 400, details);
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', details) {
        super('VALIDATION_ERROR', message, 400, details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super('UNAUTHORIZED', message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super('FORBIDDEN', message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super('NOT_FOUND', `${resource} not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class MethodNotAllowedError extends AppError {
    constructor(method, allowedMethods) {
        super('METHOD_NOT_ALLOWED', `Method ${method} not allowed`, 405, { allowedMethods });
    }
}
exports.MethodNotAllowedError = MethodNotAllowedError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists', details) {
        super('CONFLICT', message, 409, details);
    }
}
exports.ConflictError = ConflictError;
class GoneError extends AppError {
    constructor(message = 'Resource no longer available') {
        super('GONE', message, 410);
    }
}
exports.GoneError = GoneError;
// In utils/errors.ts
class InsufficientQuestionsError extends AppError {
    constructor(found, requested) {
        super(`Insufficient questions available. Found ${found}, requested ${requested}. Try different filters.`, 'INSUFFICIENT_QUESTIONS');
    }
}
exports.InsufficientQuestionsError = InsufficientQuestionsError;
class PayloadTooLargeError extends AppError {
    constructor(maxSize) {
        super('PAYLOAD_TOO_LARGE', `Payload exceeds maximum size of ${maxSize}`, 413);
    }
}
exports.PayloadTooLargeError = PayloadTooLargeError;
class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable entity', details) {
        super('UNPROCESSABLE_ENTITY', message, 422, details);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', retryAfter) {
        super('RATE_LIMITED', message, 429, retryAfter ? { retryAfter } : undefined);
    }
}
exports.RateLimitError = RateLimitError;
// ============================================
// HTTP Error Classes (5xx)
// ============================================
class InternalError extends AppError {
    constructor(message = 'Internal server error') {
        super('INTERNAL_ERROR', message, 500, undefined, false);
    }
}
exports.InternalError = InternalError;
class NotImplementedError extends AppError {
    constructor(feature = 'This feature') {
        super('NOT_IMPLEMENTED', `${feature} is not implemented`, 501);
    }
}
exports.NotImplementedError = NotImplementedError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable', retryAfter) {
        super('SERVICE_UNAVAILABLE', message, 503, retryAfter ? { retryAfter } : undefined);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
// ============================================
// Authentication Errors
// ============================================
class TokenExpiredError extends AppError {
    constructor() {
        super('TOKEN_EXPIRED', 'Your session has expired. Please login again.', 401);
    }
}
exports.TokenExpiredError = TokenExpiredError;
class InvalidTokenError extends AppError {
    constructor(message = 'Invalid token') {
        super('INVALID_TOKEN', message, 401);
    }
}
exports.InvalidTokenError = InvalidTokenError;
class TokenRevokedError extends AppError {
    constructor() {
        super('TOKEN_REVOKED', 'Token has been revoked. Please login again.', 401);
    }
}
exports.TokenRevokedError = TokenRevokedError;
// ============================================
// Session Errors
// ============================================
class SessionExpiredError extends AppError {
    constructor(expiredAt) {
        super('SESSION_EXPIRED', 'This session has expired and cannot be modified', 403, { expiredAt: expiredAt.toISOString() });
    }
}
exports.SessionExpiredError = SessionExpiredError;
class SessionInProgressError extends AppError {
    constructor(sessionId, expiresAt) {
        super('SESSION_IN_PROGRESS', 'You already have an active session', 409, {
            activeSessionId: sessionId,
            expiresAt: expiresAt.toISOString(),
        });
    }
}
exports.SessionInProgressError = SessionInProgressError;
class SessionNotStartedError extends AppError {
    constructor() {
        super('SESSION_NOT_STARTED', 'This session has not been started yet', 400);
    }
}
exports.SessionNotStartedError = SessionNotStartedError;
class SessionNotCompletedError extends AppError {
    constructor() {
        super('SESSION_NOT_COMPLETED', 'Results are only available after the session is completed', 403);
    }
}
exports.SessionNotCompletedError = SessionNotCompletedError;
class SessionAlreadyCompletedError extends AppError {
    constructor(completedAt) {
        super('SESSION_ALREADY_COMPLETED', 'This session has already been submitted', 400, { completedAt: completedAt.toISOString() });
    }
}
exports.SessionAlreadyCompletedError = SessionAlreadyCompletedError;
// ============================================
// Quiz/Question Errors
// ============================================
class InvalidOptionError extends AppError {
    constructor(questionId) {
        super('INVALID_OPTION', 'The selected option does not belong to this question', 400, questionId ? { questionId } : undefined);
    }
}
exports.InvalidOptionError = InvalidOptionError;
class QuestionNotInSessionError extends AppError {
    constructor(questionId) {
        super('QUESTION_NOT_IN_SESSION', 'This question is not part of the current session', 400, { questionId });
    }
}
exports.QuestionNotInSessionError = QuestionNotInSessionError;
class AnswerAlreadySubmittedError extends AppError {
    constructor(questionId) {
        super('ANSWER_ALREADY_SUBMITTED', 'An answer has already been submitted for this question', 409, { questionId });
    }
}
exports.AnswerAlreadySubmittedError = AnswerAlreadySubmittedError;
// ============================================
// Institute Errors
// ============================================
class InstituteInactiveError extends AppError {
    constructor(instituteName) {
        super('INSTITUTE_INACTIVE', instituteName
            ? `Institute "${instituteName}" is currently inactive`
            : 'Your institute is currently inactive. Please contact support.', 403);
    }
}
exports.InstituteInactiveError = InstituteInactiveError;
class DomainNotAllowedError extends AppError {
    constructor(domain) {
        super('DOMAIN_NOT_ALLOWED', `Email domain "${domain}" is not allowed for this institute`, 403, { domain });
    }
}
exports.DomainNotAllowedError = DomainNotAllowedError;
class InstituteLimitReachedError extends AppError {
    constructor(limitType, limit) {
        super('INSTITUTE_LIMIT_REACHED', `Institute has reached the maximum ${limitType} limit of ${limit}`, 403, { limitType, limit });
    }
}
exports.InstituteLimitReachedError = InstituteLimitReachedError;
// ============================================
// File/Upload Errors
// ============================================
class FileUploadError extends AppError {
    constructor(message = 'File upload failed', details) {
        super('FILE_UPLOAD_ERROR', message, 400, details);
    }
}
exports.FileUploadError = FileUploadError;
class InvalidFileTypeError extends AppError {
    constructor(allowedTypes) {
        super('INVALID_FILE_TYPE', `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400, { allowedTypes });
    }
}
exports.InvalidFileTypeError = InvalidFileTypeError;
class FileTooLargeError extends AppError {
    constructor(maxSize) {
        super('FILE_TOO_LARGE', `File size exceeds maximum limit of ${maxSize}`, 400);
    }
}
exports.FileTooLargeError = FileTooLargeError;
// ============================================
// External Service Errors
// ============================================
class ExternalServiceError extends AppError {
    constructor(serviceName, message) {
        super('EXTERNAL_SERVICE_ERROR', message || `Error communicating with ${serviceName}`, 502, { service: serviceName }, false);
    }
}
exports.ExternalServiceError = ExternalServiceError;
class AIServiceError extends AppError {
    constructor(message = 'AI service error', details) {
        super('AI_SERVICE_ERROR', message, 502, details, false);
    }
}
exports.AIServiceError = AIServiceError;
// ============================================
// Database Errors
// ============================================
class DatabaseError extends AppError {
    constructor(message = 'Database error') {
        super('DATABASE_ERROR', message, 500, undefined, false);
    }
}
exports.DatabaseError = DatabaseError;
class TransactionError extends AppError {
    constructor(message = 'Transaction failed') {
        super('TRANSACTION_ERROR', message, 500, undefined, false);
    }
}
exports.TransactionError = TransactionError;
//# sourceMappingURL=errors.js.map