import { PrismaClient, Prisma } from '@prisma/client';
/**
 * Prisma.TransactionClient is the correct type for interactive transactions.
 */
export type TransactionClient = Prisma.TransactionClient;
export type TransactionOptions = {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
};
export declare class PrismaService {
    private readonly _client;
    constructor(client?: PrismaClient);
    get client(): PrismaClient;
    get user(): Prisma.UserDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get institute(): Prisma.InstituteDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get refreshToken(): Prisma.RefreshTokenDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get resume(): Prisma.ResumeDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get aiInterviewSession(): Prisma.AiInterviewSessionDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get aiInterviewResponse(): Prisma.AiInterviewResponseDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get aiInterviewFeedback(): Prisma.AiInterviewFeedbackDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * Health check with timeout to prevent hanging connections
     */
    healthCheck(timeoutMs?: number): Promise<boolean>;
    transaction<T>(fn: (tx: TransactionClient) => Promise<T>, options?: TransactionOptions): Promise<T>;
    /**
     * Batch transaction (parallel query execution)
     */
    transactionBatch<T = unknown>(queries: Prisma.PrismaPromise<T>[]): Promise<T[]>;
    executeRaw(query: string, ...values: unknown[]): Promise<number>;
    queryRaw<T = unknown>(query: string, ...values: unknown[]): Promise<T[]>;
    softDelete<Model extends keyof PrismaClient>(modelName: Model, where: Record<string, unknown>): Promise<unknown>;
    restore<Model extends keyof PrismaClient>(modelName: Model, where: Record<string, unknown>): Promise<unknown>;
}
export declare const prismaService: PrismaService;
export default prismaService;
//# sourceMappingURL=prisma.service.d.ts.map