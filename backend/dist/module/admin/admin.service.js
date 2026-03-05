"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminErrors = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../lib/db");
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
exports.AdminErrors = {
    INSTITUTE_NOT_FOUND: 'INSTITUTE_NOT_FOUND',
    INSTITUTE_DOMAIN_EXISTS: 'INSTITUTE_DOMAIN_EXISTS',
    INSTITUTE_HAS_USERS: 'INSTITUTE_HAS_USERS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_EMAIL_EXISTS: 'USER_EMAIL_EXISTS',
    CANNOT_DELETE_PLATFORM_ADMIN: 'CANNOT_DELETE_PLATFORM_ADMIN',
    CANNOT_MODIFY_PLATFORM_ADMIN: 'CANNOT_MODIFY_PLATFORM_ADMIN',
};
// =====================================================
// SELECT CLAUSES
// =====================================================
const userInclude = {
    institute: { select: { id: true, name: true, domain: true } },
    profile: {
        select: {
            fullName: true,
            studentId: true,
            departmentId: true,
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
};
const instituteInclude = {
    profile: true,
    _count: { select: { users: true } },
};
// =====================================================
// HELPERS
// =====================================================
function paginate(page, limit) {
    const p = page || DEFAULT_PAGE;
    const l = limit || DEFAULT_LIMIT;
    return { page: p, limit: l, skip: (p - 1) * l };
}
function totalPages(total, limit) {
    return Math.ceil(total / limit);
}
function omitPassword(obj) {
    const { password: _, ...rest } = obj;
    return rest;
}
function toDateStr(date) {
    return date.toISOString().split('T')[0];
}
function createDailyMap(days) {
    const map = new Map();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        map.set(toDateStr(d), 0);
    }
    return map;
}
function aggregateTrends(dates, days) {
    const map = createDailyMap(days);
    dates.forEach((d) => {
        const key = toDateStr(d);
        if (map.has(key))
            map.set(key, map.get(key) + 1);
    });
    return Array.from(map, ([date, count]) => ({ date, count }));
}
function buildDateRangeFilter(startDate, endDate) {
    if (!startDate || !endDate)
        return undefined;
    return { gte: new Date(startDate), lte: new Date(endDate) };
}
// =====================================================
// ADMIN SERVICE
// =====================================================
class AdminService {
    // ===========================================
    // ANALYTICS
    // ===========================================
    async getPlatformAnalytics(dateRange) {
        const dateFilter = dateRange
            ? { gte: dateRange.startDate, lte: dateRange.endDate }
            : undefined;
        const [instituteStats, userStats, aptitude, machine, interview, regTrends, sessionTrends,] = await Promise.all([
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
            .filter((s) => s.role === client_1.UserRole.USER)
            .reduce((a, c) => a + c._count, 0);
        const totalInstituteAdmins = userStats
            .filter((s) => s.role === client_1.UserRole.INSTITUTE_ADMIN)
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
    async groupInstitutes() {
        const result = await db_1.prisma.institute.groupBy({ by: ['isActive'], _count: true });
        return result.map((r) => ({ _count: r._count, isActive: r.isActive }));
    }
    async groupUsers() {
        const result = await db_1.prisma.user.groupBy({ by: ['role', 'isActive'], _count: true });
        return result.map((r) => ({ _count: r._count, role: r.role, isActive: r.isActive }));
    }
    async aggregateAptitude(dateFilter) {
        const where = dateFilter ? { createdAt: dateFilter } : {};
        const [total, agg] = await Promise.all([
            db_1.prisma.aptitudePracticeSession.count({ where }),
            db_1.prisma.aptitudePracticeSession.aggregate({
                where: { ...where, completedAt: { not: null } },
                _count: true,
                _avg: { totalScore: true },
            }),
        ]);
        return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
    }
    async aggregateMachine(dateFilter) {
        const where = dateFilter ? { createdAt: dateFilter } : {};
        const [total, agg] = await Promise.all([
            db_1.prisma.machinePracticeSession.count({ where }),
            db_1.prisma.machinePracticeSession.aggregate({
                where: { ...where, completedAt: { not: null } },
                _count: true,
                _avg: { totalScore: true },
            }),
        ]);
        return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
    }
    async aggregateInterview(dateFilter) {
        const where = dateFilter ? { createdAt: dateFilter } : {};
        const [total, completed, avg] = await Promise.all([
            db_1.prisma.aiInterviewSession.count({ where }),
            db_1.prisma.aiInterviewSession.count({ where: { ...where, status: 'COMPLETED' } }),
            db_1.prisma.aiInterviewFeedback.aggregate({ where, _avg: { overallScore: true } }),
        ]);
        return { total, completed, avgScore: Number(avg._avg.overallScore) || 0 };
    }
    async getRegistrationTrends() {
        const since = new Date();
        since.setDate(since.getDate() - TREND_DAYS);
        const users = await db_1.prisma.user.findMany({
            where: { createdAt: { gte: since } },
            select: { createdAt: true },
        });
        return aggregateTrends(users.map((u) => u.createdAt), TREND_DAYS);
    }
    async getSessionTrends() {
        const since = new Date();
        since.setDate(since.getDate() - TREND_DAYS);
        const where = { createdAt: { gte: since } };
        const select = { createdAt: true };
        const [apt, mac, int] = await Promise.all([
            db_1.prisma.aptitudePracticeSession.findMany({ where, select }),
            db_1.prisma.machinePracticeSession.findMany({ where, select }),
            db_1.prisma.aiInterviewSession.findMany({ where, select }),
        ]);
        const all = [...apt, ...mac, ...int].map((s) => s.createdAt);
        return aggregateTrends(all, TREND_DAYS);
    }
    // ===========================================
    // INSTITUTES
    // ===========================================
    async listInstitutes(filters) {
        const { page, limit, skip } = paginate(filters.page, filters.limit);
        const where = this.buildInstituteWhere(filters);
        const orderBy = this.buildInstituteOrder(filters);
        const [institutes, total] = await Promise.all([
            db_1.prisma.institute.findMany({ where, include: instituteInclude, orderBy, skip, take: limit }),
            db_1.prisma.institute.count({ where }),
        ]);
        return {
            institutes: institutes,
            total,
            page,
            limit,
            totalPages: totalPages(total, limit),
        };
    }
    async getInstitute(id) {
        const inst = await db_1.prisma.institute.findUnique({ where: { id }, include: instituteInclude });
        if (!inst)
            throw new Error(exports.AdminErrors.INSTITUTE_NOT_FOUND);
        return inst;
    }
    async createInstitute(input) {
        await this.ensureUniqueDomain(input.domain);
        const inst = await db_1.prisma.institute.create({
            data: {
                name: input.name,
                domain: input.domain,
                isActive: input.isActive ?? true,
                profile: input.profile ? { create: input.profile } : undefined,
            },
            include: instituteInclude,
        });
        return inst;
    }
    async updateInstitute(id, input) {
        const existing = await this.findInstitute(id);
        if (input.domain && input.domain !== existing.domain) {
            await this.ensureUniqueDomain(input.domain);
        }
        const inst = await db_1.prisma.institute.update({
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
        return inst;
    }
    async deleteInstitute(id) {
        const inst = await db_1.prisma.institute.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } },
        });
        if (!inst)
            throw new Error(exports.AdminErrors.INSTITUTE_NOT_FOUND);
        if (inst._count.users > 0)
            throw new Error(exports.AdminErrors.INSTITUTE_HAS_USERS);
        await db_1.prisma.institute.delete({ where: { id } });
    }
    async toggleInstituteStatus(id) {
        const inst = await this.findInstitute(id);
        return this.updateInstitute(id, { isActive: !inst.isActive });
    }
    async getInstituteStats(id) {
        await this.findInstitute(id);
        const filter = { user: { instituteId: id } };
        const [userStats, apt, mac, int] = await Promise.all([
            db_1.prisma.user.groupBy({ by: ['isActive'], where: { instituteId: id }, _count: true }),
            this.aggregateInstituteAptitude(filter),
            this.aggregateInstituteMachine(filter),
            this.aggregateInstituteInterview(filter),
        ]);
        const totalUsers = userStats.reduce((a, c) => a + c._count, 0);
        const activeUsers = userStats.find((s) => s.isActive)?._count || 0;
        return { totalUsers, activeUsers, ...apt, ...mac, ...int };
    }
    async getInstituteStudents(id, filters) {
        await this.findInstitute(id);
        const { page, limit, skip } = paginate(filters.page, filters.limit);
        const where = this.buildStudentWhere(id, filters);
        const orderBy = this.buildStudentOrder(filters);
        const [students, total] = await Promise.all([
            db_1.prisma.user.findMany({ where, include: userInclude, orderBy, skip, take: limit }),
            db_1.prisma.user.count({ where }),
        ]);
        return {
            students: students.map(omitPassword),
            total,
            page,
            limit,
            totalPages: totalPages(total, limit),
        };
    }
    async getInstituteAdmins(id) {
        await this.findInstitute(id);
        const admins = await db_1.prisma.user.findMany({
            where: { instituteId: id, role: client_1.UserRole.INSTITUTE_ADMIN },
            include: userInclude,
        });
        return admins.map(omitPassword);
    }
    buildInstituteWhere(f) {
        const where = {};
        if (f.search) {
            where.OR = [
                { name: { contains: f.search, mode: 'insensitive' } },
                { domain: { contains: f.search, mode: 'insensitive' } },
            ];
        }
        if (f.isActive !== undefined)
            where.isActive = f.isActive;
        return where;
    }
    buildInstituteOrder(f) {
        if (f.sortBy === 'totalStudents')
            return { users: { _count: f.sortOrder || 'desc' } };
        return { [f.sortBy || 'createdAt']: f.sortOrder || 'desc' };
    }
    buildStudentWhere(instituteId, f) {
        const where = { instituteId, role: client_1.UserRole.USER };
        if (f.search) {
            where.OR = [
                { name: { contains: f.search, mode: 'insensitive' } },
                { email: { contains: f.search, mode: 'insensitive' } },
                { profile: { fullName: { contains: f.search, mode: 'insensitive' } } },
                { profile: { studentId: { contains: f.search, mode: 'insensitive' } } },
            ];
        }
        if (f.departmentId)
            where.profile = { departmentId: f.departmentId };
        if (f.courseYear)
            where.profile = { ...where.profile, courseYear: f.courseYear };
        if (f.isActive !== undefined)
            where.isActive = f.isActive;
        return where;
    }
    buildStudentOrder(f) {
        if (f.sortBy === 'averageCgpa')
            return { profile: { averageCgpa: f.sortOrder || 'desc' } };
        return { [f.sortBy || 'createdAt']: f.sortOrder || 'desc' };
    }
    async aggregateInstituteAptitude(filter) {
        const [total, agg] = await Promise.all([
            db_1.prisma.aptitudePracticeSession.count({ where: filter }),
            db_1.prisma.aptitudePracticeSession.aggregate({
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
    async aggregateInstituteMachine(filter) {
        const [total, agg] = await Promise.all([
            db_1.prisma.machinePracticeSession.count({ where: filter }),
            db_1.prisma.machinePracticeSession.aggregate({
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
    async aggregateInstituteInterview(filter) {
        const [total, completed, avg] = await Promise.all([
            db_1.prisma.aiInterviewSession.count({ where: filter }),
            db_1.prisma.aiInterviewSession.count({ where: { ...filter, status: 'COMPLETED' } }),
            db_1.prisma.aiInterviewFeedback.aggregate({ where: filter, _avg: { overallScore: true } }),
        ]);
        return {
            totalInterviewSessions: total,
            completedInterviewSessions: completed,
            avgInterviewScore: Number(avg._avg.overallScore) || 0,
        };
    }
    async findInstitute(id) {
        const inst = await db_1.prisma.institute.findUnique({ where: { id } });
        if (!inst)
            throw new Error(exports.AdminErrors.INSTITUTE_NOT_FOUND);
        return inst;
    }
    async ensureUniqueDomain(domain) {
        const exists = await db_1.prisma.institute.findUnique({ where: { domain } });
        if (exists)
            throw new Error(exports.AdminErrors.INSTITUTE_DOMAIN_EXISTS);
    }
    // ===========================================
    // USERS
    // ===========================================
    async listUsers(filters) {
        const { page, limit, skip } = paginate(filters.page, filters.limit);
        const where = this.buildUserWhere(filters);
        const orderBy = { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' };
        const [users, total] = await Promise.all([
            db_1.prisma.user.findMany({ where, include: userInclude, orderBy, skip, take: limit }),
            db_1.prisma.user.count({ where }),
        ]);
        return {
            users: users.map(omitPassword),
            total,
            page,
            limit,
            totalPages: totalPages(total, limit),
        };
    }
    async getUser(id) {
        const user = await db_1.prisma.user.findUnique({ where: { id }, include: userInclude });
        if (!user)
            throw new Error(exports.AdminErrors.USER_NOT_FOUND);
        return omitPassword(user);
    }
    async createUser(input) {
        await this.ensureUniqueEmail(input.email);
        if (input.instituteId)
            await this.findInstitute(input.instituteId);
        const user = await db_1.prisma.user.create({
            data: {
                email: input.email,
                password: await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS),
                name: input.name,
                role: input.role || client_1.UserRole.USER,
                instituteId: input.instituteId,
                isActive: input.isActive ?? true,
            },
            include: userInclude,
        });
        return omitPassword(user);
    }
    async updateUser(id, input) {
        const existing = await this.findUser(id);
        if (input.email && input.email !== existing.email) {
            await this.ensureUniqueEmail(input.email);
        }
        if (input.instituteId)
            await this.findInstitute(input.instituteId);
        const data = {
            email: input.email,
            name: input.name,
            role: input.role,
            isActive: input.isActive,
        };
        if (input.password) {
            data.password = await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS);
        }
        if (input.instituteId !== undefined) {
            data.institute = input.instituteId
                ? { connect: { id: input.instituteId } }
                : { disconnect: true };
        }
        const user = await db_1.prisma.user.update({ where: { id }, data, include: userInclude });
        return omitPassword(user);
    }
    async deleteUser(id) {
        const user = await this.findUser(id);
        if (user.role === client_1.UserRole.PLATFORM_ADMIN) {
            throw new Error(exports.AdminErrors.CANNOT_DELETE_PLATFORM_ADMIN);
        }
        await db_1.prisma.user.delete({ where: { id } });
    }
    async toggleUserStatus(id) {
        const user = await this.findUser(id);
        if (user.role === client_1.UserRole.PLATFORM_ADMIN) {
            throw new Error(exports.AdminErrors.CANNOT_MODIFY_PLATFORM_ADMIN);
        }
        return this.updateUser(id, { isActive: !user.isActive });
    }
    async resetUserPassword(id, newPassword) {
        await this.findUser(id);
        await db_1.prisma.user.update({
            where: { id },
            data: { password: await bcryptjs_1.default.hash(newPassword, BCRYPT_ROUNDS) },
        });
    }
    async getUserStats(id) {
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
    buildUserWhere(f) {
        const where = {};
        if (f.search) {
            where.OR = [
                { name: { contains: f.search, mode: 'insensitive' } },
                { email: { contains: f.search, mode: 'insensitive' } },
                { profile: { fullName: { contains: f.search, mode: 'insensitive' } } },
            ];
        }
        if (f.role)
            where.role = f.role;
        if (f.instituteId)
            where.instituteId = f.instituteId;
        if (f.isActive !== undefined)
            where.isActive = f.isActive;
        if (f.hasProfile !== undefined)
            where.profile = f.hasProfile ? { isNot: null } : { is: null };
        return where;
    }
    async userAptitudeStats(userId) {
        const [total, agg] = await Promise.all([
            db_1.prisma.aptitudePracticeSession.count({ where: { userId } }),
            db_1.prisma.aptitudePracticeSession.aggregate({
                where: { userId, completedAt: { not: null } },
                _count: true,
                _avg: { totalScore: true },
            }),
        ]);
        return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
    }
    async userMachineStats(userId) {
        const [total, agg] = await Promise.all([
            db_1.prisma.machinePracticeSession.count({ where: { userId } }),
            db_1.prisma.machinePracticeSession.aggregate({
                where: { userId, completedAt: { not: null } },
                _count: true,
                _avg: { totalScore: true },
            }),
        ]);
        return { total, completed: agg._count, avgScore: agg._avg.totalScore || 0 };
    }
    async userInterviewStats(userId) {
        const [total, completed, avg] = await Promise.all([
            db_1.prisma.aiInterviewSession.count({ where: { userId } }),
            db_1.prisma.aiInterviewSession.count({ where: { userId, status: 'COMPLETED' } }),
            db_1.prisma.aiInterviewFeedback.aggregate({ where: { userId }, _avg: { overallScore: true } }),
        ]);
        return { total, completed, avgScore: Number(avg._avg.overallScore) || 0 };
    }
    async findUser(id) {
        const user = await db_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new Error(exports.AdminErrors.USER_NOT_FOUND);
        return user;
    }
    async ensureUniqueEmail(email) {
        const exists = await db_1.prisma.user.findUnique({ where: { email } });
        if (exists)
            throw new Error(exports.AdminErrors.USER_EMAIL_EXISTS);
    }
    // ===========================================
    // REPORTS
    // ===========================================
    async getInstitutesReport(filters) {
        const dateRange = buildDateRangeFilter(filters.startDate, filters.endDate);
        const where = dateRange ? { createdAt: dateRange } : {};
        const institutes = await db_1.prisma.institute.findMany({
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
    async getUsersReport(filters) {
        const dateRange = buildDateRangeFilter(filters.startDate, filters.endDate);
        const where = {};
        if (dateRange) {
            where.createdAt = dateRange;
        }
        if (filters.instituteId) {
            where.instituteId = filters.instituteId;
        }
        const users = await db_1.prisma.user.findMany({
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
    async getActivityReport(filters) {
        const { startDate, endDate } = this.getReportDateRange(filters);
        const dateRange = { gte: startDate, lte: endDate };
        const instFilter = filters.instituteId ? { user: { instituteId: filters.instituteId } } : {};
        const [users, apt, mac, int] = await Promise.all([
            db_1.prisma.user.findMany({
                where: {
                    createdAt: dateRange,
                    ...(filters.instituteId ? { instituteId: filters.instituteId } : {}),
                },
                select: { createdAt: true },
            }),
            db_1.prisma.aptitudePracticeSession.findMany({
                where: { createdAt: dateRange, ...instFilter },
                select: { createdAt: true },
            }),
            db_1.prisma.machinePracticeSession.findMany({
                where: { createdAt: dateRange, ...instFilter },
                select: { createdAt: true },
            }),
            db_1.prisma.aiInterviewSession.findMany({
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
    getReportDateRange(f) {
        const endDate = f.endDate ? new Date(f.endDate) : new Date();
        const startDate = f.startDate
            ? new Date(f.startDate)
            : new Date(endDate.getTime() - TREND_DAYS * 24 * 60 * 60 * 1000);
        return { startDate, endDate };
    }
    async buildInstituteReportItem(inst) {
        const avg = await db_1.prisma.aiInterviewFeedback.aggregate({
            where: { user: { instituteId: inst.id } },
            _avg: { overallScore: true },
        });
        const totalSessions = inst.users.reduce((a, u) => a + u._count.aptitudeSessions + u._count.machineSessions + u._count.aiInterviewSessions, 0);
        return {
            id: inst.id,
            name: inst.name,
            domain: inst.domain,
            isActive: inst.isActive,
            location: inst.profile?.location || null,
            totalStudents: inst.users.filter((u) => u.role === client_1.UserRole.USER).length,
            totalAdmins: inst.users.filter((u) => u.role === client_1.UserRole.INSTITUTE_ADMIN).length,
            totalSessions,
            avgScore: Number(avg._avg.overallScore) || 0,
            createdAt: inst.createdAt,
        };
    }
    async buildUserReportItem(user) {
        const avg = await db_1.prisma.aiInterviewFeedback.aggregate({
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
    buildActivityItems(startDate, endDate, users, apt, mac, int) {
        const map = new Map();
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
            if (entry)
                entry.newUsers++;
        });
        apt.forEach((s) => {
            const key = toDateStr(s.createdAt);
            const entry = map.get(key);
            if (entry)
                entry.aptitudeSessions++;
        });
        mac.forEach((s) => {
            const key = toDateStr(s.createdAt);
            const entry = map.get(key);
            if (entry)
                entry.machineSessions++;
        });
        int.forEach((s) => {
            const key = toDateStr(s.createdAt);
            const entry = map.get(key);
            if (entry)
                entry.interviewSessions++;
        });
        return Array.from(map, ([date, data]) => ({
            date,
            ...data,
            totalSessions: data.aptitudeSessions + data.machineSessions + data.interviewSessions,
        }));
    }
}
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.js.map