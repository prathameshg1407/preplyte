import { z } from 'zod';
export declare const dashboardQuerySchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodOptional<z.ZodEnum<["this_month", "last_month", "this_week", "last_7_days", "last_30_days"]>>>;
}, "strip", z.ZodTypeAny, {
    period: "this_month" | "last_month" | "this_week" | "last_7_days" | "last_30_days";
}, {
    period?: "this_month" | "last_month" | "this_week" | "last_7_days" | "last_30_days" | undefined;
}>;
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export declare const parseDashboardQuery: (query: unknown) => DashboardQuery;
//# sourceMappingURL=dashboard.validation.d.ts.map