import { UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/db';
import {
  CreateInstituteInput,
  UpdateInstituteInput,
  InstituteFilters,
  InstituteWithStats,
  InstituteStats,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserWithDetails,
  UserStats,
  StudentFilters,
  PlatformAnalytics,
  DateRange,
  ReportFilters,
  InstituteReport,
  UserReport,
  ActivityReport,
  TrendData,
  SessionStats,
  InstituteReportItem,
  UserReportItem,
  ActivityItem,
} from './admin.types';

// =====================================================
// CONSTANTS
// =====================================================

const BCRYPT_ROUNDS = 12;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const TREND_DAYS = 30;

// =====================================================
// ERROR CODES
// =====================================================

export const AdminErrors = {
  INSTITUTE_NOT_FOUND: 'INSTITUTE_NOT_FOUND',
  INSTITUTE_DOMAIN_EXISTS: 'INSTITUTE_DOMAIN_EXISTS',
  INSTITUTE_HAS_USERS: 'INSTITUTE_HAS_USERS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_EMAIL_EXISTS: 'USER_EMAIL_EXISTS',
  CANNOT_DELETE_PLATFORM_ADMIN: 'CANNOT_DELETE_PLATFORM_ADMIN',
  CANNOT_MODIFY_PLATFORM_ADMIN: 'CANNOT_MODIFY_PLATFORM_ADMIN',
} as const;

// =====================================================
// SELECT CLAUSES
// =====================================================

const userInclude = {
  institute: { select: { id: true, name: true, domain: true } },
  profile: {
    select: {
      fullName: true,
      studentId: true,
      department: true,
      courseYear: true,
      averageCgpa: true,
      skills: true,
    },
  },
  _count: {
    select: {
      aptitudeSessions: true,
      machineSessions: true,
      aiInterviewSessions: true,
      resumes: true,
    },
  },
} as const;

const instituteInclude = {
  profile: true,
  _count: { select: { users: true } },
} as const;

// =====================================================
// HELPERS
// =====================================================

function paginate(page?: number, limit?: number) {
  const p = page || DEFAULT_PAGE;
  const l = limit || DEFAULT_LIMIT;
  return { page: p, limit: l, skip: (p - 1) * l };
}

function totalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

function omitPassword<T extends { password?: string }>(obj: T): Omit<T, 'password'> {
  const { password: _, ...rest } = obj;
  return rest;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function createDailyMap(days: number): Map<string, number> {
  const map = new Map<string, number>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map.set(toDateStr(d), 0);
  }
  return map;
}

function aggregateTrends(dates: Date[], days: number): TrendData[] {
  const map = createDailyMap(days);
  dates.forEach((d) => {
    const key = toDateStr(d);
    if (map.has(key)) map.set(key, map.get(key)! + 1);
  });
  return Array.from(map, ([date, count]) => ({ date, count }));
}

function buildDateRangeFilter(startDate?: string, endDate?: string): { gte: Date; lte: Date } | undefined {
  if (!startDate || !endDate) return undefined;
  return { gte: new Date(startDate), lte: new Date(endDate) };
}

// =====================================================
// ADMIN SERVICE
// =====================================================

class AdminService {
  // ===========================================
  // ANALYTICS
  // ===========================================

  async getPlatformAnalytics(dateRange?: DateRange): Promise<PlatformAnalytics> {
    const dateFilter = dateRange
      ? { gte: dateRange.startDate, lte: dateRange.endDate }
      : undefined;

    const [
      instituteStats,
      userStats,
      aptitude,
      machine,
      interview,
      regTrends,
      sessionTrends,
    ] = await Promise.all([
      this.groupInstitutes(),
      this.groupUsers(),
      this.aggregateAptitude(dateFilter),
      this.aggregateMachine(dateFilter),
      this.aggregateInterview(dateFilter),
      this.getRegistrationTrends(),
      this.getSessionTrends(),
    ]);

    const totalInstitutes = instituteStats.reduce((a, c) => a + c._count, 0);
    const activeInstitutes = instituteStats.find((s) => s.isActive)?._count || 0;
    const totalUsers = userStats.reduce((a, c) => a + c._count, 0);
    const activeUsers = userStats.filter((s) => s.isActive).reduce((a, c) => a + c._count, 0);
    const totalStudents = userStats
      .filter((s) => s.role === UserRole.USER)
      .reduce((a, c) => a + c._count, 0);
    const totalInstituteAdmins = userStats
      .filter((s) => s.role === UserRole.INSTITUTE_ADMIN)
      .reduce((a, c) => a + c._count, 0);

    return {
      overview: {
        totalInstitutes,
        activeInstitutes,
        totalUsers,
        activeUsers,
        totalStudents,
        totalInstituteAdmins,
      },
      sessions: {
        totalAptitudeSessions: aptitude.total,
        completedAptitudeSessions: aptitude.completed,
        totalMachineSessions: machine.total,
        completedMachineSessions: machine.completed,
        totalInterviewSessions: interview.total,
        completedInterviewSessions: interview.completed,
      },
      performance: {
        avgAptitudeScore: aptitude.avgScore,
        avgMachineScore: machine.avgScore,
        avgInterviewScore: interview.avgScore,
      },
      trends: {
        userRegistrations: regTrends,
        sessionActivity: sessionTrends,
      },
    };
  }

  private async groupInstitutes() {
    const result = await prisma.institute.groupBy({ by: ['isActive'], _count: true });
    return result.map((r) => ({ _count: r._count, isActive: r.isActive }));
  }

  private async groupUsers() {
    const result = await prisma.user.groupBy({ by: ['role', 'isActive'], _count: true });
    return result.map((r) => ({ _count: r._count, role: r.role, isActive: r.isActive }));
  }

  private async aggregateAptitude(dateFilter?: Prisma.DateTimeFilter): Promise<SessionStats> {
    const where = dateFilter ? { createdAt: dateFilter } : {};
    const [total, agg] = await Promise.all([
      prisma.aptitudePracticeSession.count({ where }),
      prisma.aptitudePracticeSession.aggregate({
        where: { ...where, completedAt: { not: null } },
        _count: true,
        _avg: { totalScore: true },
      }),
    ]);
    return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
  }

  private async aggregateMachine(dateFilter?: Prisma.DateTimeFilter): Promise<SessionStats> {
    const where = dateFilter ? { createdAt: dateFilter } : {};
    const [total, agg] = await Promise.all([
      prisma.machinePracticeSession.count({ where }),
      prisma.machinePracticeSession.aggregate({
        where: { ...where, completedAt: { not: null } },
        _count: true,
        _avg: { totalScore: true },
      }),
    ]);
    return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
  }

  private async aggregateInterview(dateFilter?: Prisma.DateTimeFilter): Promise<SessionStats> {
    const where = dateFilter ? { createdAt: dateFilter } : {};
    const [total, completed, avg] = await Promise.all([
      prisma.aiInterviewSession.count({ where }),
      prisma.aiInterviewSession.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.aiInterviewFeedback.aggregate({ where, _avg: { overallScore: true } }),
    ]);
    return { total, completed, avgScore: Number(avg._avg.overallScore) || 0 };
  }

  private async getRegistrationTrends(): Promise<TrendData[]> {
    const since = new Date();
    since.setDate(since.getDate() - TREND_DAYS);
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
    return aggregateTrends(users.map((u) => u.createdAt), TREND_DAYS);
  }

  private async getSessionTrends(): Promise<TrendData[]> {
    const since = new Date();
    since.setDate(since.getDate() - TREND_DAYS);
    const where = { createdAt: { gte: since } };
    const select = { createdAt: true };

    const [apt, mac, int] = await Promise.all([
      prisma.aptitudePracticeSession.findMany({ where, select }),
      prisma.machinePracticeSession.findMany({ where, select }),
      prisma.aiInterviewSession.findMany({ where, select }),
    ]);

    const all = [...apt, ...mac, ...int].map((s) => s.createdAt);
    return aggregateTrends(all, TREND_DAYS);
  }

  // ===========================================
  // INSTITUTES
  // ===========================================

  async listInstitutes(filters: InstituteFilters) {
    const { page, limit, skip } = paginate(filters.page, filters.limit);
    const where = this.buildInstituteWhere(filters);
    const orderBy = this.buildInstituteOrder(filters);

    const [institutes, total] = await Promise.all([
      prisma.institute.findMany({ where, include: instituteInclude, orderBy, skip, take: limit }),
      prisma.institute.count({ where }),
    ]);

    return {
      institutes: institutes as InstituteWithStats[],
      total,
      page,
      limit,
      totalPages: totalPages(total, limit),
    };
  }

  async getInstitute(id: string): Promise<InstituteWithStats> {
    const inst = await prisma.institute.findUnique({ where: { id }, include: instituteInclude });
    if (!inst) throw new Error(AdminErrors.INSTITUTE_NOT_FOUND);
    return inst as InstituteWithStats;
  }

  async createInstitute(input: CreateInstituteInput): Promise<InstituteWithStats> {
    await this.ensureUniqueDomain(input.domain);

    const inst = await prisma.institute.create({
      data: {
        name: input.name,
        domain: input.domain,
        isActive: input.isActive ?? true,
        profile: input.profile ? { create: input.profile } : undefined,
      },
      include: instituteInclude,
    });

    return inst as InstituteWithStats;
  }

  async updateInstitute(id: string, input: UpdateInstituteInput): Promise<InstituteWithStats> {
    const existing = await this.findInstitute(id);

    if (input.domain && input.domain !== existing.domain) {
      await this.ensureUniqueDomain(input.domain);
    }

    const inst = await prisma.institute.update({
      where: { id },
      data: {
        name: input.name,
        domain: input.domain,
        isActive: input.isActive,
        profile: input.profile
          ? { upsert: { create: input.profile, update: input.profile } }
          : undefined,
      },
      include: instituteInclude,
    });

    return inst as InstituteWithStats;
  }

  async deleteInstitute(id: string): Promise<void> {
    const inst = await prisma.institute.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!inst) throw new Error(AdminErrors.INSTITUTE_NOT_FOUND);
    if (inst._count.users > 0) throw new Error(AdminErrors.INSTITUTE_HAS_USERS);

    await prisma.institute.delete({ where: { id } });
  }

  async toggleInstituteStatus(id: string): Promise<InstituteWithStats> {
    const inst = await this.findInstitute(id);
    return this.updateInstitute(id, { isActive: !inst.isActive });
  }

  async getInstituteStats(id: string): Promise<InstituteStats> {
    await this.findInstitute(id);
    const filter = { user: { instituteId: id } };

    const [userStats, apt, mac, int] = await Promise.all([
      prisma.user.groupBy({ by: ['isActive'], where: { instituteId: id }, _count: true }),
      this.aggregateInstituteAptitude(filter),
      this.aggregateInstituteMachine(filter),
      this.aggregateInstituteInterview(filter),
    ]);

    const totalUsers = userStats.reduce((a, c) => a + c._count, 0);
    const activeUsers = userStats.find((s) => s.isActive)?._count || 0;

    return { totalUsers, activeUsers, ...apt, ...mac, ...int };
  }

  async getInstituteStudents(id: string, filters: StudentFilters) {
    await this.findInstitute(id);
    const { page, limit, skip } = paginate(filters.page, filters.limit);
    const where = this.buildStudentWhere(id, filters);
    const orderBy = this.buildStudentOrder(filters);

    const [students, total] = await Promise.all([
      prisma.user.findMany({ where, include: userInclude, orderBy, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    return {
      students: students.map(omitPassword),
      total,
      page,
      limit,
      totalPages: totalPages(total, limit),
    };
  }

  async getInstituteAdmins(id: string): Promise<UserWithDetails[]> {
    await this.findInstitute(id);
    const admins = await prisma.user.findMany({
      where: { instituteId: id, role: UserRole.INSTITUTE_ADMIN },
      include: userInclude,
    });
    return admins.map(omitPassword);
  }

  private buildInstituteWhere(f: InstituteFilters): Prisma.InstituteWhereInput {
    const where: Prisma.InstituteWhereInput = {};
    if (f.search) {
      where.OR = [
        { name: { contains: f.search, mode: 'insensitive' } },
        { domain: { contains: f.search, mode: 'insensitive' } },
      ];
    }
    if (f.isActive !== undefined) where.isActive = f.isActive;
    return where;
  }

  private buildInstituteOrder(f: InstituteFilters): Prisma.InstituteOrderByWithRelationInput {
    if (f.sortBy === 'totalStudents') return { users: { _count: f.sortOrder || 'desc' } };
    return { [f.sortBy || 'createdAt']: f.sortOrder || 'desc' };
  }

  private buildStudentWhere(instituteId: string, f: StudentFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = { instituteId, role: UserRole.USER };

    if (f.search) {
      where.OR = [
        { name: { contains: f.search, mode: 'insensitive' } },
        { email: { contains: f.search, mode: 'insensitive' } },
        { profile: { fullName: { contains: f.search, mode: 'insensitive' } } },
        { profile: { studentId: { contains: f.search, mode: 'insensitive' } } },
      ];
    }

    if (f.department) where.profile = { department: f.department };
    if (f.courseYear) where.profile = { ...(where.profile as object), courseYear: f.courseYear };
    if (f.isActive !== undefined) where.isActive = f.isActive;

    return where;
  }

  private buildStudentOrder(f: StudentFilters): Prisma.UserOrderByWithRelationInput {
    if (f.sortBy === 'averageCgpa') return { profile: { averageCgpa: f.sortOrder || 'desc' } };
    return { [f.sortBy || 'createdAt']: f.sortOrder || 'desc' };
  }

  private async aggregateInstituteAptitude(filter: { user: { instituteId: string } }) {
    const [total, agg] = await Promise.all([
      prisma.aptitudePracticeSession.count({ where: filter }),
      prisma.aptitudePracticeSession.aggregate({
        where: { ...filter, completedAt: { not: null } },
        _count: true,
        _avg: { totalScore: true },
      }),
    ]);
    return {
      totalAptitudeSessions: total,
      completedAptitudeSessions: agg._count,
      avgAptitudeScore: agg._avg.totalScore || 0,
    };
  }

  private async aggregateInstituteMachine(filter: { user: { instituteId: string } }) {
    const [total, agg] = await Promise.all([
      prisma.machinePracticeSession.count({ where: filter }),
      prisma.machinePracticeSession.aggregate({
        where: { ...filter, completedAt: { not: null } },
        _count: true,
        _avg: { totalScore: true },
      }),
    ]);
    return {
      totalMachineSessions: total,
      completedMachineSessions: agg._count,
      avgMachineScore: agg._avg.totalScore || 0,
    };
  }

  private async aggregateInstituteInterview(filter: { user: { instituteId: string } }) {
    const [total, completed, avg] = await Promise.all([
      prisma.aiInterviewSession.count({ where: filter }),
      prisma.aiInterviewSession.count({ where: { ...filter, status: 'COMPLETED' } }),
      prisma.aiInterviewFeedback.aggregate({ where: filter, _avg: { overallScore: true } }),
    ]);
    return {
      totalInterviewSessions: total,
      completedInterviewSessions: completed,
      avgInterviewScore: Number(avg._avg.overallScore) || 0,
    };
  }

  private async findInstitute(id: string) {
    const inst = await prisma.institute.findUnique({ where: { id } });
    if (!inst) throw new Error(AdminErrors.INSTITUTE_NOT_FOUND);
    return inst;
  }

  private async ensureUniqueDomain(domain: string): Promise<void> {
    const exists = await prisma.institute.findUnique({ where: { domain } });
    if (exists) throw new Error(AdminErrors.INSTITUTE_DOMAIN_EXISTS);
  }

  // ===========================================
  // USERS
  // ===========================================

  async listUsers(filters: UserFilters) {
    const { page, limit, skip } = paginate(filters.page, filters.limit);
    const where = this.buildUserWhere(filters);
    const orderBy = { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, include: userInclude, orderBy, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(omitPassword),
      total,
      page,
      limit,
      totalPages: totalPages(total, limit),
    };
  }

  async getUser(id: string): Promise<UserWithDetails> {
    const user = await prisma.user.findUnique({ where: { id }, include: userInclude });
    if (!user) throw new Error(AdminErrors.USER_NOT_FOUND);
    return omitPassword(user);
  }

  async createUser(input: CreateUserInput): Promise<UserWithDetails> {
    await this.ensureUniqueEmail(input.email);
    if (input.instituteId) await this.findInstitute(input.instituteId);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
        name: input.name,
        role: input.role || UserRole.USER,
        instituteId: input.instituteId,
        isActive: input.isActive ?? true,
      },
      include: userInclude,
    });

    return omitPassword(user);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<UserWithDetails> {
    const existing = await this.findUser(id);

    if (input.email && input.email !== existing.email) {
      await this.ensureUniqueEmail(input.email);
    }

    if (input.instituteId) await this.findInstitute(input.instituteId);

    const data: Prisma.UserUpdateInput = {
      email: input.email,
      name: input.name,
      role: input.role,
      isActive: input.isActive,
    };

    if (input.password) {
      data.password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    }

    if (input.instituteId !== undefined) {
      data.institute = input.instituteId
        ? { connect: { id: input.instituteId } }
        : { disconnect: true };
    }

    const user = await prisma.user.update({ where: { id }, data, include: userInclude });
    return omitPassword(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findUser(id);
    if (user.role === UserRole.PLATFORM_ADMIN) {
      throw new Error(AdminErrors.CANNOT_DELETE_PLATFORM_ADMIN);
    }
    await prisma.user.delete({ where: { id } });
  }

  async toggleUserStatus(id: string): Promise<UserWithDetails> {
    const user = await this.findUser(id);
    if (user.role === UserRole.PLATFORM_ADMIN) {
      throw new Error(AdminErrors.CANNOT_MODIFY_PLATFORM_ADMIN);
    }
    return this.updateUser(id, { isActive: !user.isActive });
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await this.findUser(id);
    await prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) },
    });
  }

  async getUserStats(id: string): Promise<UserStats> {
    await this.findUser(id);

    const [apt, mac, int] = await Promise.all([
      this.userAptitudeStats(id),
      this.userMachineStats(id),
      this.userInterviewStats(id),
    ]);

    return {
      totalAptitudeSessions: apt.total,
      completedAptitudeSessions: apt.completed,
      avgAptitudeScore: apt.avgScore,
      totalMachineSessions: mac.total,
      completedMachineSessions: mac.completed,
      avgMachineScore: mac.avgScore,
      totalInterviewSessions: int.total,
      completedInterviewSessions: int.completed,
      avgInterviewScore: int.avgScore,
    };
  }

  private buildUserWhere(f: UserFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (f.search) {
      where.OR = [
        { name: { contains: f.search, mode: 'insensitive' } },
        { email: { contains: f.search, mode: 'insensitive' } },
        { profile: { fullName: { contains: f.search, mode: 'insensitive' } } },
      ];
    }

    if (f.role) where.role = f.role;
    if (f.instituteId) where.instituteId = f.instituteId;
    if (f.isActive !== undefined) where.isActive = f.isActive;
    if (f.hasProfile !== undefined) where.profile = f.hasProfile ? { isNot: null } : { is: null };

    return where;
  }

  private async userAptitudeStats(userId: string): Promise<SessionStats> {
    const [total, agg] = await Promise.all([
      prisma.aptitudePracticeSession.count({ where: { userId } }),
      prisma.aptitudePracticeSession.aggregate({
        where: { userId, completedAt: { not: null } },
        _count: true,
        _avg: { totalScore: true },
      }),
    ]);
    return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
  }

  private async userMachineStats(userId: string): Promise<SessionStats> {
    const [total, agg] = await Promise.all([
      prisma.machinePracticeSession.count({ where: { userId } }),
      prisma.machinePracticeSession.aggregate({
        where: { userId, completedAt: { not: null } },
        _count: true,
        _avg: { totalScore: true },
      }),
    ]);
    return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
  }

  private async userInterviewStats(userId: string): Promise<SessionStats> {
    const [total, completed, avg] = await Promise.all([
      prisma.aiInterviewSession.count({ where: { userId } }),
      prisma.aiInterviewSession.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.aiInterviewFeedback.aggregate({ where: { userId }, _avg: { overallScore: true } }),
    ]);
    return { total, completed, avgScore: Number(avg._avg.overallScore) || 0 };
  }

  private async findUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error(AdminErrors.USER_NOT_FOUND);
    return user;
  }

  private async ensureUniqueEmail(email: string): Promise<void> {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error(AdminErrors.USER_EMAIL_EXISTS);
  }

  // ===========================================
  // REPORTS
  // ===========================================

  async getInstitutesReport(filters: ReportFilters): Promise<InstituteReport> {
    const dateRange = buildDateRangeFilter(filters.startDate, filters.endDate);
    const where: Prisma.InstituteWhereInput = dateRange ? { createdAt: dateRange } : {};

    const institutes = await prisma.institute.findMany({
      where,
      include: {
        profile: true,
        users: {
          select: {
            role: true,
            _count: {
              select: {
                aptitudeSessions: true,
                machineSessions: true,
                aiInterviewSessions: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = await Promise.all(institutes.map((i) => this.buildInstituteReportItem(i)));

    return { institutes: items, generatedAt: new Date(), totalCount: items.length };
  }

  async getUsersReport(filters: ReportFilters): Promise<UserReport> {
    const dateRange = buildDateRangeFilter(filters.startDate, filters.endDate);
    
    const where: Prisma.UserWhereInput = {};
    if (dateRange) {
      where.createdAt = dateRange;
    }
    if (filters.instituteId) {
      where.instituteId = filters.instituteId;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        institute: { select: { name: true } },
        _count: {
          select: {
            aptitudeSessions: true,
            machineSessions: true,
            aiInterviewSessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = await Promise.all(users.map((u) => this.buildUserReportItem(u)));

    return { users: items, generatedAt: new Date(), totalCount: items.length };
  }

  async getActivityReport(filters: ReportFilters): Promise<ActivityReport> {
    const { startDate, endDate } = this.getReportDateRange(filters);
    const dateRange = { gte: startDate, lte: endDate };
    const instFilter = filters.instituteId ? { user: { instituteId: filters.instituteId } } : {};

    const [users, apt, mac, int] = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: dateRange,
          ...(filters.instituteId ? { instituteId: filters.instituteId } : {}),
        },
        select: { createdAt: true },
      }),
      prisma.aptitudePracticeSession.findMany({
        where: { createdAt: dateRange, ...instFilter },
        select: { createdAt: true },
      }),
      prisma.machinePracticeSession.findMany({
        where: { createdAt: dateRange, ...instFilter },
        select: { createdAt: true },
      }),
      prisma.aiInterviewSession.findMany({
        where: { createdAt: dateRange, ...instFilter },
        select: { createdAt: true },
      }),
    ]);

    const activities = this.buildActivityItems(startDate, endDate, users, apt, mac, int);
    const totalSessions = apt.length + mac.length + int.length;

    return {
      activities,
      summary: {
        totalNewUsers: users.length,
        totalSessions,
        avgDailySessions: activities.length ? Math.round((totalSessions / activities.length) * 100) / 100 : 0,
      },
      generatedAt: new Date(),
    };
  }

  private getReportDateRange(f: ReportFilters): { startDate: Date; endDate: Date } {
    const endDate = f.endDate ? new Date(f.endDate) : new Date();
    const startDate = f.startDate
      ? new Date(f.startDate)
      : new Date(endDate.getTime() - TREND_DAYS * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }

  private async buildInstituteReportItem(inst: {
    id: string;
    name: string;
    domain: string;
    isActive: boolean;
    createdAt: Date;
    profile: { location: string | null } | null;
    users: Array<{
      role: UserRole;
      _count: {
        aptitudeSessions: number;
        machineSessions: number;
        aiInterviewSessions: number;
      };
    }>;
  }): Promise<InstituteReportItem> {
    const avg = await prisma.aiInterviewFeedback.aggregate({
      where: { user: { instituteId: inst.id } },
      _avg: { overallScore: true },
    });

    const totalSessions = inst.users.reduce(
      (a, u) => a + u._count.aptitudeSessions + u._count.machineSessions + u._count.aiInterviewSessions,
      0
    );

    return {
      id: inst.id,
      name: inst.name,
      domain: inst.domain,
      isActive: inst.isActive,
      location: inst.profile?.location || null,
      totalStudents: inst.users.filter((u) => u.role === UserRole.USER).length,
      totalAdmins: inst.users.filter((u) => u.role === UserRole.INSTITUTE_ADMIN).length,
      totalSessions,
      avgScore: Number(avg._avg.overallScore) || 0,
      createdAt: inst.createdAt,
    };
  }

  private async buildUserReportItem(user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    institute: { name: string } | null;
    _count: {
      aptitudeSessions: number;
      machineSessions: number;
      aiInterviewSessions: number;
    };
  }): Promise<UserReportItem> {
    const avg = await prisma.aiInterviewFeedback.aggregate({
      where: { userId: user.id },
      _avg: { overallScore: true },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      instituteName: user.institute?.name || null,
      totalSessions: user._count.aptitudeSessions + user._count.machineSessions + user._count.aiInterviewSessions,
      avgScore: Number(avg._avg.overallScore) || 0,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  private buildActivityItems(
    startDate: Date,
    endDate: Date,
    users: { createdAt: Date }[],
    apt: { createdAt: Date }[],
    mac: { createdAt: Date }[],
    int: { createdAt: Date }[]
  ): ActivityItem[] {
    const map = new Map<string, Omit<ActivityItem, 'date' | 'totalSessions'>>();

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      map.set(toDateStr(new Date(d)), {
        newUsers: 0,
        aptitudeSessions: 0,
        machineSessions: 0,
        interviewSessions: 0,
      });
    }

    users.forEach((u) => {
      const key = toDateStr(u.createdAt);
      const entry = map.get(key);
      if (entry) entry.newUsers++;
    });

    apt.forEach((s) => {
      const key = toDateStr(s.createdAt);
      const entry = map.get(key);
      if (entry) entry.aptitudeSessions++;
    });

    mac.forEach((s) => {
      const key = toDateStr(s.createdAt);
      const entry = map.get(key);
      if (entry) entry.machineSessions++;
    });

    int.forEach((s) => {
      const key = toDateStr(s.createdAt);
      const entry = map.get(key);
      if (entry) entry.interviewSessions++;
    });

    return Array.from(map, ([date, data]) => ({
      date,
      ...data,
      totalSessions: data.aptitudeSessions + data.machineSessions + data.interviewSessions,
    }));
  }
}

export const adminService = new AdminService();