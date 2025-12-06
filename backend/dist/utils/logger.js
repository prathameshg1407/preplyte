"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = exports.logError = exports.logRequest = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
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
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    return log;
}));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// ============================================
// Transports
// ============================================
const transports = [
    new winston_1.default.transports.Console({
        format: consoleFormat,
        level: LOG_LEVEL,
    }),
];
// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    // Error logs
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(LOG_DIR, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: LOG_MAX_FILES,
        maxSize: LOG_MAX_SIZE,
        format: fileFormat,
        zippedArchive: true,
    }));
    // Combined logs
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(LOG_DIR, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: LOG_MAX_FILES,
        maxSize: LOG_MAX_SIZE,
        format: fileFormat,
        zippedArchive: true,
    }));
    // Access logs (info level only)
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(LOG_DIR, 'access-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxFiles: LOG_MAX_FILES,
        maxSize: LOG_MAX_SIZE,
        format: fileFormat,
        zippedArchive: true,
    }));
}
// ============================================
// Logger Instance
// ============================================
exports.logger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'preplyte-api',
    },
    transports,
    exceptionHandlers: process.env.NODE_ENV === 'production'
        ? [
            new winston_daily_rotate_file_1.default({
                filename: path_1.default.join(LOG_DIR, 'exceptions-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: LOG_MAX_FILES,
                format: fileFormat,
                zippedArchive: true,
            }),
        ]
        : undefined,
    rejectionHandlers: process.env.NODE_ENV === 'production'
        ? [
            new winston_daily_rotate_file_1.default({
                filename: path_1.default.join(LOG_DIR, 'rejections-%DATE%.log'),
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
const logRequest = (method, path, statusCode, duration, userId) => {
    exports.logger.info('HTTP Request', {
        method,
        path,
        statusCode,
        duration: `${duration}ms`,
        userId,
    });
};
exports.logRequest = logRequest;
const logError = (error, context) => {
    exports.logger.error(error.message, {
        stack: error.stack,
        ...context,
    });
};
exports.logError = logError;
const logSecurityEvent = (event, details) => {
    exports.logger.warn(`Security Event: ${event}`, {
        type: 'security',
        ...details,
    });
};
exports.logSecurityEvent = logSecurityEvent;
//# sourceMappingURL=logger.js.map