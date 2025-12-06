export declare const TIME_PERIODS: {
    readonly THIS_MONTH: "this_month";
    readonly LAST_MONTH: "last_month";
    readonly THIS_WEEK: "this_week";
    readonly LAST_7_DAYS: "last_7_days";
    readonly LAST_30_DAYS: "last_30_days";
};
export declare const DASHBOARD_LIMITS: {
    readonly RECENT_TESTS: 5;
    readonly UPCOMING_TESTS: 5;
    readonly RECENT_DRIVES: 5;
    readonly TOP_PERFORMERS: 10;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly BAD_REQUEST: 400;
    readonly NOT_FOUND: 404;
    readonly FORBIDDEN: 403;
};
export declare const DASHBOARD_CACHE_KEYS: {
    readonly studentDashboard: (userId: string) => string;
    readonly instituteDashboard: (instituteId: string) => string;
    readonly platformDashboard: () => string;
};
export declare const DASHBOARD_CACHE_TTL: {
    readonly STUDENT: 60;
    readonly INSTITUTE: 120;
    readonly PLATFORM: 300;
};
export declare const getDateRanges: () => {
    now: Date;
    startOfToday: Date;
    startOfThisMonth: Date;
    startOfLastMonth: Date;
    endOfLastMonth: Date;
    startOfThisWeek: Date;
    last7Days: Date;
    last30Days: Date;
};
//# sourceMappingURL=dashboard.constants.d.ts.map