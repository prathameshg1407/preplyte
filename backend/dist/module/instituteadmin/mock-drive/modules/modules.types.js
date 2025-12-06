"use strict";
// src/modules/instituteadmin/mock-drive/modules/modules.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleConfigError = exports.ModuleOrderConflictError = exports.ModuleValidationError = exports.ModuleNotFoundError = exports.ModuleError = void 0;
exports.isAptitudeConfig = isAptitudeConfig;
exports.isMachineCodingConfig = isMachineCodingConfig;
exports.isAiInterviewConfig = isAiInterviewConfig;
// ============================================
// Type Guards
// ============================================
function isAptitudeConfig(config) {
    return 'questionTypes' in config && 'marksPerQuestion' in config;
}
function isMachineCodingConfig(config) {
    return 'allowedLanguages' in config && 'maxScorePerQuestion' in config;
}
function isAiInterviewConfig(config) {
    return 'jobTitle' in config && 'focusAreas' in config;
}
// ============================================
// Error Classes
// ============================================
class ModuleError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'ModuleError';
    }
}
exports.ModuleError = ModuleError;
class ModuleNotFoundError extends ModuleError {
    constructor(moduleId) {
        super('MODULE_NOT_FOUND', `Module not found: ${moduleId}`, 404);
    }
}
exports.ModuleNotFoundError = ModuleNotFoundError;
class ModuleValidationError extends ModuleError {
    constructor(message) {
        super('MODULE_VALIDATION_ERROR', message, 400);
    }
}
exports.ModuleValidationError = ModuleValidationError;
class ModuleOrderConflictError extends ModuleError {
    constructor(order) {
        super('MODULE_ORDER_CONFLICT', `Module with order ${order} already exists`, 409);
    }
}
exports.ModuleOrderConflictError = ModuleOrderConflictError;
class ModuleConfigError extends ModuleError {
    constructor(message) {
        super('MODULE_CONFIG_ERROR', message, 400);
    }
}
exports.ModuleConfigError = ModuleConfigError;
//# sourceMappingURL=modules.types.js.map