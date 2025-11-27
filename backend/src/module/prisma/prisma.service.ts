import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';

// ============================================
// Types
// ============================================

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

type TransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
};

// ============================================
// Prisma Service Class
// ============================================

export class PrismaService {
  private readonly _client: PrismaClient;

  constructor() {
    this._client = prisma;
  }

  // ============================================
  // Client Accessors
  // ============================================

  get client(): PrismaClient {
    return this._client;
  }

  // ============================================
  // Model Accessors
  // ============================================

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
  // Transaction Methods - Simplified
  // ============================================

  /**
   * Execute interactive transaction
   */
  async transaction<T>(
    fn: (tx: TransactionClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    return this._client.$transaction(fn, options);
  }

  /**
   * Execute batch transaction with array of queries
   * Using 'any' here because Prisma's internal types are complex
   */
  async transactionBatch(queries: Prisma.PrismaPromise<any>[]): Promise<any[]> {
    return this._client.$transaction(queries);
  }

  // ============================================
  // Utility Methods
  // ============================================

  async disconnect(): Promise<void> {
    await this._client.$disconnect();
  }

  async connect(): Promise<void> {
    await this._client.$connect();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this._client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // Query Helpers
  // ============================================

  /**
   * Execute a raw query safely
   */
  async executeRaw(query: string, ...values: unknown[]): Promise<number> {
    return this._client.$executeRawUnsafe(query, ...values);
  }

  /**
   * Query with raw SQL safely
   */
  async queryRaw<T = unknown>(query: string, ...values: unknown[]): Promise<T[]> {
    return this._client.$queryRawUnsafe<T[]>(query, ...values);
  }

  /**
   * Soft delete helper - updates deletedAt field
   */
  async softDelete<T extends keyof PrismaClient>(
    modelName: T,
    where: Record<string, unknown>
  ): Promise<unknown> {
    const model = this._client[modelName] as any;
    if (model?.update) {
      return model.update({
        where,
        data: { deletedAt: new Date() },
      });
    }
    throw new Error(`Model ${String(modelName)} does not support update`);
  }

  /**
   * Restore soft deleted record
   */
  async restore<T extends keyof PrismaClient>(
    modelName: T,
    where: Record<string, unknown>
  ): Promise<unknown> {
    const model = this._client[modelName] as any;
    if (model?.update) {
      return model.update({
        where,
        data: { deletedAt: null },
      });
    }
    throw new Error(`Model ${String(modelName)} does not support update`);
  }
}

// ============================================
// Singleton Export
// ============================================

export const prismaService = new PrismaService();