import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logRequest: (method: string, path: string, statusCode: number, duration: number, userId?: string) => void;
export declare const logError: (error: Error, context?: Record<string, unknown>) => void;
export declare const logSecurityEvent: (event: string, details: Record<string, unknown>) => void;
//# sourceMappingURL=logger.d.ts.map