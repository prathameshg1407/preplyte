import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { logger } from '../../utils/logger';

// ============================================
// Types
// ============================================

/**
 * Prisma.TransactionClient is the correct type for interactive transactions.
 */
export type TransactionClient = Prisma.TransactionClient;

export type TransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
};

// ============================================
// Prisma Service
// ============================================

export class PrismaService {
  private readonly _client: PrismaClient;

  constructor(client?: PrismaClient) {
    this._client = client ?? prisma;
  }

  // -----------------------------
  // Raw Prisma client access
  // -----------------------------
  get client(): PrismaClient {
    return this._client;
  }

  // -----------------------------
  // Convenience model accessors
  // -----------------------------
  get user() {
    return this._client.user;
  }

  get institute() {
    return this._client.institute;
  }

  get refreshToken() {
    return this._client.refreshToken;
  }

  get resume() {
    return this._client.resume;
  }

  get aiInterviewSession() {
    return this._client.aiInterviewSession;
  }

  get aiInterviewResponse() {
    return this._client.aiInterviewResponse;
  }

  get aiInterviewFeedback() {
    return this._client.aiInterviewFeedback;
  }

  // ============================================
  // Connection Lifecycle
  // ============================================

  async connect(): Promise<void> {
    try {
      await this._client.$connect();
    } catch (err) {
      logger.error('[PrismaService] connect failed', { error: err });
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this._client.$disconnect();
    } catch (err) {
      logger.warn('[PrismaService] disconnect failed', { error: err });
    }
  }

  /**
   * Health check with timeout to prevent hanging connections
   */
  async healthCheck(timeoutMs = 2000): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      await Promise.race([
        this._client.$queryRaw`SELECT 1`,
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () =>
            reject(new Error('timeout'))
          );
        }),
      ]);
      return true;
    } catch (err: any) {
      logger.warn('[PrismaService] healthCheck failed', {
        error: err.message,
      });
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  // ============================================
  // Transactions
  // ============================================

  // Overload signature to enforce callback transaction form
  async transaction<T>(
    fn: (tx: TransactionClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T>;

  // Implementation
  async transaction<T>(
    fn: (tx: TransactionClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    try {
      return await (this._client as any).$transaction(fn, options);
    } catch (err: any) {
      logger.error('[PrismaService] transaction failed', {
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Batch transaction (parallel query execution)
   */
  async transactionBatch<T = unknown>(
    queries: Prisma.PrismaPromise<T>[]
  ): Promise<T[]> {
    try {
      return await this._client.$transaction(queries);
    } catch (err: any) {
      logger.error('[PrismaService] transactionBatch failed', {
        error: err.message,
      });
      throw err;
    }
  }

  // ============================================
  // Raw Queries
  // ============================================

  async executeRaw(query: string, ...values: unknown[]): Promise<number> {
    try {
      return await this._client.$executeRawUnsafe(query, ...values);
    } catch (err: any) {
      logger.error('[PrismaService] executeRaw failed', {
        query,
        error: err.message,
      });
      throw err;
    }
  }

  async queryRaw<T = unknown>(
    query: string,
    ...values: unknown[]
  ): Promise<T[]> {
    try {
      return await this._client.$queryRawUnsafe<T[]>(query, ...values);
    } catch (err: any) {
      logger.error('[PrismaService] queryRaw failed', {
        query,
        error: err.message,
      });
      throw err;
    }
  }

  // ============================================
  // Soft Delete Helpers
  // ============================================

  async softDelete<Model extends keyof PrismaClient>(
    modelName: Model,
    where: Record<string, unknown>
  ): Promise<unknown> {
    const model: any = this._client[modelName];
    if (!model?.update) {
      throw new Error(`Model ${String(modelName)} does not support update()`);
    }

    try {
      return await model.update({
        where,
        data: { deletedAt: new Date() },
      });
    } catch (err: any) {
      logger.error('[PrismaService] softDelete failed', {
        model: String(modelName),
        error: err.message,
      });
      throw err;
    }
  }

  async restore<Model extends keyof PrismaClient>(
    modelName: Model,
    where: Record<string, unknown>
  ): Promise<unknown> {
    const model: any = this._client[modelName];
    if (!model?.update) {
      throw new Error(`Model ${String(modelName)} does not support update()`);
    }

    try {
      return await model.update({
        where,
        data: { deletedAt: null },
      });
    } catch (err: any) {
      logger.error('[PrismaService] restore failed', {
        model: String(modelName),
        error: err.message,
      });
      throw err;
    }
  }
}

// ============================================
// Singleton Export
// ============================================

export const prismaService = new PrismaService();
export default prismaService;
