"use strict";
// src/modules/instituteadmin/mock-drive/analytics/analytics.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientDataError = exports.AnalyticsError = void 0;
const common_types_1 = require("../common/common.types");
// ============================================
// Error Classes
// ============================================
class AnalyticsError extends common_types_1.BaseError {
    constructor(code = 'ANALYTICS_ERROR', message, statusCode = 400) {
        super(code, message, statusCode);
    }
}
exports.AnalyticsError = AnalyticsError;
class InsufficientDataError extends AnalyticsError {
    constructor(message = 'Insufficient data for analytics') {
        super('INSUFFICIENT_DATA', message, 400);
    }
}
exports.InsufficientDataError = InsufficientDataError;
//# sourceMappingURL=analytics.types.js.map