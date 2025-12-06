"use strict";
// src/module/mock-drive/attempt/executors/base.executor.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModuleExecutor = void 0;
// ============================================
// Abstract Base Executor
// ============================================
class BaseModuleExecutor {
    prisma;
    moduleType;
    constructor(prisma, moduleType) {
        this.prisma = prisma;
        this.moduleType = moduleType;
    }
    /**
     * Validate that context has required data
     */
    validateContext(context) {
        if (!context.attemptId || !context.moduleAttemptId || !context.moduleId) {
            throw new Error('Invalid executor context: missing required IDs');
        }
    }
    /**
     * Check if action is valid for this executor
     */
    isValidAction(action, validActions) {
        return validActions.includes(action);
    }
}
exports.BaseModuleExecutor = BaseModuleExecutor;
//# sourceMappingURL=base.executor.js.map