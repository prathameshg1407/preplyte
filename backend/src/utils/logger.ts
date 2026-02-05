import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// ============================================
// Configuration
// ============================================

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const LOG_MAX_FILES = process.env.LOG_MAX_FILES || '30d';
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || '20m';

// ============================================
// Custom Formats
// ============================================

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (stack) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ============================================
// Transports
// ============================================

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    level: LOG_LEVEL,
  }),
];

// Add file transports (Enabled for debugging)
if (true) {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
      format: fileFormat,
      zippedArchive: true,
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
      format: fileFormat,
      zippedArchive: true,
    })
  );

  // Access logs (info level only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
      format: fileFormat,
      zippedArchive: true,
    })
  );
}

// ============================================
// Logger Instance
// ============================================

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'preplyte-api',
  },
  transports,
  exceptionHandlers: process.env.NODE_ENV === 'production'
    ? [
      new DailyRotateFile({
        filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: LOG_MAX_FILES,
        format: fileFormat,
        zippedArchive: true,
      }),
    ]
    : undefined,
  rejectionHandlers: process.env.NODE_ENV === 'production'
    ? [
      new DailyRotateFile({
        filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: LOG_MAX_FILES,
        format: fileFormat,
        zippedArchive: true,
      }),
    ]
    : undefined,
});

// ============================================
// Helper Methods
// ============================================

export const logRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) => {
  logger.info('HTTP Request', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    userId,
  });
};

export const logError = (
  error: Error,
  context?: Record<string, unknown>
) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown>
) => {
  logger.warn(`Security Event: ${event}`, {
    type: 'security',
    ...details,
  });
};