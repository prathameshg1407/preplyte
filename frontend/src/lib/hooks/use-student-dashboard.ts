import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';

interface DashboardStats {
  testsCompleted: number;
  totalTests: number;
  interviewsCompleted: number;
  totalInterviews: number;
  problemsSolved: number;
  totalProblems: number;
  overallScore: number;
}

interface RecentTest {
  id: string;
  title: string;
  type: 'APTITUDE' | 'MACHINE' | 'INTERVIEW';
  score: number;
  total: number;
  date: string;
  status: string;
}

interface UpcomingTest {
  id: string;
  title: string;
  date: string;
  duration: string;
  difficulty: string;
  status: string;
  moduleCount: number;
}

interface DashboardAppliedOpportunity {
  id: string;
  title: string;
  companyName: string;
  type: 'JOB' | 'INTERNSHIP';
  status: string;
  appliedAt: string;
}

interface DashboardHackathonRegistration {
  id: string;
  title: string;
  status: string;
  registrationDate: string;
  role: 'LEADER' | 'MEMBER' | 'INDIVIDUAL';
}

interface DashboardData {
  stats: DashboardStats;
  recentTests: RecentTest[];
  upcomingTests: UpcomingTest[];
  appliedOpportunities: DashboardAppliedOpportunity[];
  hackathonRegistrations: DashboardHackathonRegistration[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useStudentDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        '/api/dashboard/student'
      );
      return response.data.data;
    },
    // Only fetch when user is authenticated
    enabled: typeof window !== 'undefined',
    retry: false,
  });
}