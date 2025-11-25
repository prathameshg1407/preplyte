export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('RESOURCE_NOT_FOUND', `${resource} not found`, 404);
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

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details);
  }
}

export class SessionExpiredError extends AppError {
  constructor(expiredAt: Date) {
    super('SESSION_EXPIRED', 'This session has expired and cannot be modified', 403, {
      expiredAt: expiredAt.toISOString(),
    });
  }
}

export class SessionInProgressError extends AppError {
  constructor(sessionId: string, expiresAt: Date) {
    super('SESSION_IN_PROGRESS', 'You already have an active session', 409, {
      activeSessionId: sessionId,
      expiresAt: expiresAt.toISOString(),
    });
  }
}

export class SessionNotCompletedError extends AppError {
  constructor() {
    super('SESSION_NOT_COMPLETED', 'Results are only available after the session is completed', 403);
  }
}

export class SessionAlreadyCompletedError extends AppError {
  constructor(completedAt: Date) {
    super('SESSION_ALREADY_COMPLETED', 'This session has already been submitted', 400, {
      completedAt: completedAt.toISOString(),
    });
  }
}

export class InvalidOptionError extends AppError {
  constructor() {
    super('INVALID_OPTION', 'The selected option does not belong to this question', 400);
  }
}