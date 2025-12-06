"use strict";
// src/module/dashboard/dashboard.constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateRanges = exports.DASHBOARD_CACHE_TTL = exports.DASHBOARD_CACHE_KEYS = exports.HTTP_STATUS = exports.DASHBOARD_LIMITS = exports.TIME_PERIODS = void 0;
// =====================================================
// TIME PERIODS
// =====================================================
exports.TIME_PERIODS = {
    THIS_MONTH: 'this_month',
    LAST_MONTH: 'last_month',
    THIS_WEEK: 'this_week',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
};
// =====================================================
// LIMITS
// =====================================================
exports.DASHBOARD_LIMITS = {
    RECENT_TESTS: 5,
    UPCOMING_TESTS: 5,
    RECENT_DRIVES: 5,
    TOP_PERFORMERS: 10,
};
// =====================================================
// HTTP STATUS CODES
// =====================================================
exports.HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
};
// =====================================================
// CACHE KEYS & TTL
// =====================================================
exports.DASHBOARD_CACHE_KEYS = {
    studentDashboard: (userId) => `dashboard:student:${userId}`,
    instituteDashboard: (instituteId) => `dashboard:institute:${instituteId}`,
    platformDashboard: () => `dashboard:platform`,
};
exports.DASHBOARD_CACHE_TTL = {
    STUDENT: 60, // 1 minute
    INSTITUTE: 120, // 2 minutes
    PLATFORM: 300, // 5 minutes
};
// =====================================================
// DATE HELPERS
// =====================================================
const getDateRanges = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const last7Days = new Date(startOfToday);
    last7Days.setDate(startOfToday.getDate() - 7);
    const last30Days = new Date(startOfToday);
    last30Days.setDate(startOfToday.getDate() - 30);
    return {
        now,
        startOfToday,
        startOfThisMonth,
        startOfLastMonth,
        endOfLastMonth,
        startOfThisWeek,
        last7Days,
        last30Days,
    };
};
exports.getDateRanges = getDateRanges;
//# sourceMappingURL=dashboard.constants.js.map