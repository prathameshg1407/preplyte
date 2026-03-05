import { StudentDashboardResponse, InstituteAdminDashboardResponse, PlatformAdminDashboardResponse } from './dashboard.types';
declare class DashboardService {
    getStudentDashboard(userId: string): Promise<StudentDashboardResponse>;
    private getStudentStats;
    private getStudentRecentTests;
    private getStudentUpcomingDrives;
    private getStudentAppliedOpportunities;
    private getStudentHackathonRegistrations;
    getInstituteAdminDashboard(userId: string, instituteId: string): Promise<InstituteAdminDashboardResponse>;
    private getInstituteStats;
    private getInstituteRecentDrives;
    private getInstituteTopPerformers;
    getPlatformAdminDashboard(): Promise<PlatformAdminDashboardResponse>;
    private getPlatformOverview;
    private getPlatformSessionStats;
    private getPlatformPerformance;
    private calculateAptitudeAverage;
    private calculateMachineAverage;
    private calculateInterviewAverage;
    private getPlatformTrends;
    private aggregateTrendByDate;
    private getPlatformRecentInstitutes;
}
export declare const dashboardService: DashboardService;
export { DashboardService };
//# sourceMappingURL=dashboard.service.d.ts.map