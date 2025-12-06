"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaService = exports.PrismaService = void 0;
const db_1 = require("../../lib/db");
const logger_1 = require("../../utils/logger");
// ============================================
// Prisma Service
// ============================================
class PrismaService {
    _client;
    constructor(client) {
        this._client = client ?? db_1.prisma;
    }
    // -----------------------------
    // Raw Prisma client access
    // -----------------------------
    get client() {
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
    async connect() {
        try {
            await this._client.$connect();
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] connect failed', { error: err });
            throw err;
        }
    }
    async disconnect() {
        try {
            await this._client.$disconnect();
        }
        catch (err) {
            logger_1.logger.warn('[PrismaService] disconnect failed', { error: err });
        }
    }
    /**
     * Health check with timeout to prevent hanging connections
     */
    async healthCheck(timeoutMs = 2000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            await Promise.race([
                this._client.$queryRaw `SELECT 1`,
                new Promise((_, reject) => {
                    controller.signal.addEventListener('abort', () => reject(new Error('timeout')));
                }),
            ]);
            return true;
        }
        catch (err) {
            logger_1.logger.warn('[PrismaService] healthCheck failed', {
                error: err.message,
            });
            return false;
        }
        finally {
            clearTimeout(timer);
        }
    }
    // Implementation
    async transaction(fn, options) {
        try {
            return await this._client.$transaction(fn, options);
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] transaction failed', {
                error: err.message,
            });
            throw err;
        }
    }
    /**
     * Batch transaction (parallel query execution)
     */
    async transactionBatch(queries) {
        try {
            return await this._client.$transaction(queries);
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] transactionBatch failed', {
                error: err.message,
            });
            throw err;
        }
    }
    // ============================================
    // Raw Queries
    // ============================================
    async executeRaw(query, ...values) {
        try {
            return await this._client.$executeRawUnsafe(query, ...values);
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] executeRaw failed', {
                query,
                error: err.message,
            });
            throw err;
        }
    }
    async queryRaw(query, ...values) {
        try {
            return await this._client.$queryRawUnsafe(query, ...values);
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] queryRaw failed', {
                query,
                error: err.message,
            });
            throw err;
        }
    }
    // ============================================
    // Soft Delete Helpers
    // ============================================
    async softDelete(modelName, where) {
        const model = this._client[modelName];
        if (!model?.update) {
            throw new Error(`Model ${String(modelName)} does not support update()`);
        }
        try {
            return await model.update({
                where,
                data: { deletedAt: new Date() },
            });
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] softDelete failed', {
                model: String(modelName),
                error: err.message,
            });
            throw err;
        }
    }
    async restore(modelName, where) {
        const model = this._client[modelName];
        if (!model?.update) {
            throw new Error(`Model ${String(modelName)} does not support update()`);
        }
        try {
            return await model.update({
                where,
                data: { deletedAt: null },
            });
        }
        catch (err) {
            logger_1.logger.error('[PrismaService] restore failed', {
                model: String(modelName),
                error: err.message,
            });
            throw err;
        }
    }
}
exports.PrismaService = PrismaService;
// ============================================
// Singleton Export
// ============================================
exports.prismaService = new PrismaService();
exports.default = exports.prismaService;
//# sourceMappingURL=prisma.service.js.map