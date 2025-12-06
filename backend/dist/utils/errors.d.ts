export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown;
    readonly isOperational: boolean;
    readonly timestamp: Date;
    constructor(code: string, message: string, statusCode?: number, details?: unknown, isOperational?: boolean);
    toJSON(): {
        name: string;
        code: string;
        message: string;
        statusCode: number;
        details: unknown;
        timestamp: string;
    };
}
export declare const isAppError: (error: unknown) => error is AppError;
export declare const isOperationalError: (error: unknown) => boolean;
export declare class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class MethodNotAllowedError extends AppError {
    constructor(method: string, allowedMethods: string[]);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class GoneError extends AppError {
    constructor(message?: string);
}
export declare class InsufficientQuestionsError extends AppError {
    constructor(found: number, requested: number);
}
export declare class PayloadTooLargeError extends AppError {
    constructor(maxSize: string);
}
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, retryAfter?: number);
}
export declare class InternalError extends AppError {
    constructor(message?: string);
}
export declare class NotImplementedError extends AppError {
    constructor(feature?: string);
}
export declare class ServiceUnavailableError extends AppError {
    constructor(message?: string, retryAfter?: number);
}
export declare class TokenExpiredError extends AppError {
    constructor();
}
export declare class InvalidTokenError extends AppError {
    constructor(message?: string);
}
export declare class TokenRevokedError extends AppError {
    constructor();
}
export declare class SessionExpiredError extends AppError {
    constructor(expiredAt: Date);
}
export declare class SessionInProgressError extends AppError {
    constructor(sessionId: string, expiresAt: Date);
}
export declare class SessionNotStartedError extends AppError {
    constructor();
}
export declare class SessionNotCompletedError extends AppError {
    constructor();
}
export declare class SessionAlreadyCompletedError extends AppError {
    constructor(completedAt: Date);
}
export declare class InvalidOptionError extends AppError {
    constructor(questionId?: string);
}
export declare class QuestionNotInSessionError extends AppError {
    constructor(questionId: string);
}
export declare class AnswerAlreadySubmittedError extends AppError {
    constructor(questionId: string);
}
export declare class InstituteInactiveError extends AppError {
    constructor(instituteName?: string);
}
export declare class DomainNotAllowedError extends AppError {
    constructor(domain: string);
}
export declare class InstituteLimitReachedError extends AppError {
    constructor(limitType: string, limit: number);
}
export declare class FileUploadError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class InvalidFileTypeError extends AppError {
    constructor(allowedTypes: string[]);
}
export declare class FileTooLargeError extends AppError {
    constructor(maxSize: string);
}
export declare class ExternalServiceError extends AppError {
    constructor(serviceName: string, message?: string);
}
export declare class AIServiceError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string);
}
export declare class TransactionError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map