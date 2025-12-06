"use strict";
// src/module/dashboard/dashboard.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDashboardQuery = exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
const dashboard_constants_1 = require("./dashboard.constants");
// =====================================================
// QUERY SCHEMAS
// =====================================================
exports.dashboardQuerySchema = zod_1.z.object({
    period: zod_1.z
        .enum([
        dashboard_constants_1.TIME_PERIODS.THIS_MONTH,
        dashboard_constants_1.TIME_PERIODS.LAST_MONTH,
        dashboard_constants_1.TIME_PERIODS.THIS_WEEK,
        dashboard_constants_1.TIME_PERIODS.LAST_7_DAYS,
        dashboard_constants_1.TIME_PERIODS.LAST_30_DAYS,
    ])
        .optional()
        .default(dashboard_constants_1.TIME_PERIODS.THIS_MONTH),
});
// =====================================================
// PARSER FUNCTIONS
// =====================================================
const parseDashboardQuery = (query) => {
    return exports.dashboardQuerySchema.parse(query);
};
exports.parseDashboardQuery = parseDashboardQuery;
//# sourceMappingURL=dashboard.validation.js.map