// src/lib/errors.ts

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

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

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Ensure prototype chain is properly set
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Type guard function
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

// ============================================
// HTTP Error Classes
// ============================================

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: unknown) {
    super('BAD_REQUEST', message, 400, details);
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

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: unknown) {
    super('CONFLICT', message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super('RATE_LIMITED', message, 429, retryAfter ? { retryAfter } : undefined);
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500, undefined, false);
  }
}

// ============================================
// Domain-Specific Error Classes (Session)
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
    super(
      'SESSION_NOT_STARTED',
      'This session has not been started yet',
      400
    );
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
// Domain-Specific Error Classes (Quiz/Question)
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
// Domain-Specific Error Classes (Institute)
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