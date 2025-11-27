// ============================================
// Base Error Class
// ============================================

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: unknown,
    isOperational: boolean = true
  ) {
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

// ============================================
// Type Guard
// ============================================

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: unknown): boolean => {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
};

// ============================================
// HTTP Error Classes (4xx)
// ============================================

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: unknown) {
    super('BAD_REQUEST', message, 400, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(method: string, allowedMethods: string[]) {
    super(
      'METHOD_NOT_ALLOWED',
      `Method ${method} not allowed`,
      405,
      { allowedMethods }
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: unknown) {
    super('CONFLICT', message, 409, details);
  }
}

export class GoneError extends AppError {
  constructor(message: string = 'Resource no longer available') {
    super('GONE', message, 410);
  }
}
// In utils/errors.ts
export class InsufficientQuestionsError extends AppError {
  constructor(found: number, requested: number) {
    super(
      `Insufficient questions available. Found ${found}, requested ${requested}. Try different filters.`,
      'INSUFFICIENT_QUESTIONS'
    );
  }
}
export class PayloadTooLargeError extends AppError {
  constructor(maxSize: string) {
    super('PAYLOAD_TOO_LARGE', `Payload exceeds maximum size of ${maxSize}`, 413);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string = 'Unprocessable entity', details?: unknown) {
    super('UNPROCESSABLE_ENTITY', message, 422, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super('RATE_LIMITED', message, 429, retryAfter ? { retryAfter } : undefined);
  }
}

// ============================================
// HTTP Error Classes (5xx)
// ============================================

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500, undefined, false);
  }
}

export class NotImplementedError extends AppError {
  constructor(feature: string = 'This feature') {
    super('NOT_IMPLEMENTED', `${feature} is not implemented`, 501);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', retryAfter?: number) {
    super('SERVICE_UNAVAILABLE', message, 503, retryAfter ? { retryAfter } : undefined);
  }
}

// ============================================
// Authentication Errors
// ============================================

export class TokenExpiredError extends AppError {
  constructor() {
    super('TOKEN_EXPIRED', 'Your session has expired. Please login again.', 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid token') {
    super('INVALID_TOKEN', message, 401);
  }
}

export class TokenRevokedError extends AppError {
  constructor() {
    super('TOKEN_REVOKED', 'Token has been revoked. Please login again.', 401);
  }
}

// ============================================
// Session Errors
// ============================================

export class SessionExpiredError extends AppError {
  constructor(expiredAt: Date) {
    super(
      'SESSION_EXPIRED',
      'This session has expired and cannot be modified',
      403,
      { expiredAt: expiredAt.toISOString() }
    );
  }
}

export class SessionInProgressError extends AppError {
  constructor(sessionId: string, expiresAt: Date) {
    super(
      'SESSION_IN_PROGRESS',
      'You already have an active session',
      409,
      {
        activeSessionId: sessionId,
        expiresAt: expiresAt.toISOString(),
      }
    );
  }
}

export class SessionNotStartedError extends AppError {
  constructor() {
    super('SESSION_NOT_STARTED', 'This session has not been started yet', 400);
  }
}

export class SessionNotCompletedError extends AppError {
  constructor() {
    super(
      'SESSION_NOT_COMPLETED',
      'Results are only available after the session is completed',
      403
    );
  }
}

export class SessionAlreadyCompletedError extends AppError {
  constructor(completedAt: Date) {
    super(
      'SESSION_ALREADY_COMPLETED',
      'This session has already been submitted',
      400,
      { completedAt: completedAt.toISOString() }
    );
  }
}

// ============================================
// Quiz/Question Errors
// ============================================

export class InvalidOptionError extends AppError {
  constructor(questionId?: string) {
    super(
      'INVALID_OPTION',
      'The selected option does not belong to this question',
      400,
      questionId ? { questionId } : undefined
    );
  }
}

export class QuestionNotInSessionError extends AppError {
  constructor(questionId: string) {
    super(
      'QUESTION_NOT_IN_SESSION',
      'This question is not part of the current session',
      400,
      { questionId }
    );
  }
}

export class AnswerAlreadySubmittedError extends AppError {
  constructor(questionId: string) {
    super(
      'ANSWER_ALREADY_SUBMITTED',
      'An answer has already been submitted for this question',
      409,
      { questionId }
    );
  }
}

// ============================================
// Institute Errors
// ============================================

export class InstituteInactiveError extends AppError {
  constructor(instituteName?: string) {
    super(
      'INSTITUTE_INACTIVE',
      instituteName
        ? `Institute "${instituteName}" is currently inactive`
        : 'Your institute is currently inactive. Please contact support.',
      403
    );
  }
}

export class DomainNotAllowedError extends AppError {
  constructor(domain: string) {
    super(
      'DOMAIN_NOT_ALLOWED',
      `Email domain "${domain}" is not allowed for this institute`,
      403,
      { domain }
    );
  }
}

export class InstituteLimitReachedError extends AppError {
  constructor(limitType: string, limit: number) {
    super(
      'INSTITUTE_LIMIT_REACHED',
      `Institute has reached the maximum ${limitType} limit of ${limit}`,
      403,
      { limitType, limit }
    );
  }
}

// ============================================
// File/Upload Errors
// ============================================

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed', details?: unknown) {
    super('FILE_UPLOAD_ERROR', message, 400, details);
  }
}

export class InvalidFileTypeError extends AppError {
  constructor(allowedTypes: string[]) {
    super(
      'INVALID_FILE_TYPE',
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      400,
      { allowedTypes }
    );
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize: string) {
    super('FILE_TOO_LARGE', `File size exceeds maximum limit of ${maxSize}`, 400);
  }
}

// ============================================
// External Service Errors
// ============================================

export class ExternalServiceError extends AppError {
  constructor(serviceName: string, message?: string) {
    super(
      'EXTERNAL_SERVICE_ERROR',
      message || `Error communicating with ${serviceName}`,
      502,
      { service: serviceName },
      false
    );
  }
}

export class AIServiceError extends AppError {
  constructor(message: string = 'AI service error', details?: unknown) {
    super('AI_SERVICE_ERROR', message, 502, details, false);
  }
}

// ============================================
// Database Errors
// ============================================

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error') {
    super('DATABASE_ERROR', message, 500, undefined, false);
  }
}

export class TransactionError extends AppError {
  constructor(message: string = 'Transaction failed') {
    super('TRANSACTION_ERROR', message, 500, undefined, false);
  }
}