import { Application } from 'express';
declare const app: Application;
declare const config: {
    env: string;
    isProduction: boolean;
    isTest: boolean;
    corsOrigins: string[];
    bodyLimit: string;
    rateLimits: {
        general: {
            windowMs: number;
            max: number;
        };
        auth: {
            windowMs: number;
            max: number;
        };
        codeExecution: {
            windowMs: number;
            max: number;
        };
        admin: {
            windowMs: number;
            max: number;
        };
        profile: {
            windowMs: number;
            max: number;
        };
        upload: {
            windowMs: number;
            max: number;
        };
        mockDrive: {
            windowMs: number;
            max: number;
        };
    };
};
export default app;
export { config };
//# sourceMappingURL=app.d.ts.map