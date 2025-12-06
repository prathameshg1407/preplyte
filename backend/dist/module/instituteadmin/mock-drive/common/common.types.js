"use strict";
// src/modules/instituteadmin/mock-drive/common/common.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
// ============================================
// Base Error Class
// ============================================
class BaseError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
        };
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=common.types.js.map