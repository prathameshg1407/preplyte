import { prisma } from '../../../../lib/db';
import { LmsCourseStatus, LmsEnrollmentStatus } from '@prisma/client';
import { logError } from '../../../../utils/logger';

export class AnalyticsService {
    async getOverview() {
        try {
            const [
                counts,
                completedCount,
                publishedCount,
                avgProgressResult,
                revenueData
            ] = await Promise.all([
                (async () => {
                    const totalCourses = await prisma.lmsCourse.count();
                    const totalEnrollments = await prisma.lmsEnrollment.count();
                    const totalCategories = await prisma.lmsCategory.count();
                    const totalModules = await prisma.lmsModule.count();
                    const totalTopics = await prisma.lmsTopic.count();
                    return { totalCourses, totalEnrollments, totalCategories, totalModules, totalTopics };
                })(),
                prisma.lmsEnrollment.count({ where: { status: LmsEnrollmentStatus.COMPLETED } }),
                prisma.lmsCourse.count({ where: { status: LmsCourseStatus.PUBLISHED } }),
                prisma.lmsEnrollment.aggregate({
                    _avg: { progressPercent: true }
                }),
                prisma.lmsCourse.findMany({
                    where: { price: { gt: 0 } },
                    select: {
                        price: true,
                        discountPrice: true,
                        _count: {
                            select: { enrollments: true }
                        }
                    }
                })
            ]);

            const { totalCourses, totalEnrollments, totalCategories, totalModules, totalTopics } = counts;

            const totalRevenue = revenueData.reduce((sum, course) => {
                const effectivePrice = course.discountPrice !== null && course.discountPrice !== undefined
                    ? course.discountPrice
                    : (course.price || 0);
                return sum + (effectivePrice * course._count.enrollments);
            }, 0);

            const [enrollmentTrends, categoryStats, topCourses] = await Promise.all([
                this.getEnrollmentTrends('month').catch(() => []),
                this.getCategoryDistribution().catch(() => []),
                this.getTopCourses().catch(() => [])
            ]);

            return {
                totalCourses,
                totalEnrollments,
                totalCategories,
                totalModules,
                totalTopics,
                totalRevenue,
                completedEnrollments: completedCount,
                publishedCourses: publishedCount,
                activeEnrollments: totalEnrollments - completedCount,
                averageCompletionRate: avgProgressResult._avg.progressPercent || 0,
                enrollmentTrends,
                categoryStats,
                topCourses
            };
        } catch (error) {
            logError(error as Error, { service: 'AnalyticsService', method: 'getOverview' });
            throw error;
        }
    }

    async getEnrollmentTrends(period: 'week' | 'month' | 'year' = 'month') {
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const enrollments = await prisma.lmsEnrollment.findMany({
            where: {
                enrolledAt: {
                    gte: startDate
                }
            },
            select: {
                enrolledAt: true
            },
            take: 1000
        });

        const trendsMap = new Map<string, number>();
        enrollments.forEach(enr => {
            const dateStr = enr.enrolledAt.toISOString().split('T')[0];
            trendsMap.set(dateStr, (trendsMap.get(dateStr) || 0) + 1);
        });

        if (trendsMap.size === 0) {
            return [{ date: new Date().toISOString().split('T')[0], count: 0 }];
        }

        return Array.from(trendsMap.entries()).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getTopCourses() {
        const courses = await prisma.lmsCourse.findMany({
            take: 5,
            orderBy: {
                enrollments: { _count: 'desc' }
            },
            select: {
                id: true,
                title: true,
                price: true,
                discountPrice: true,
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (courses.length === 0) return [];

        const progressStats = await prisma.lmsEnrollment.groupBy({
            by: ['courseId'],
            where: {
                courseId: { in: courses.map(c => c.id) }
            },
            _avg: {
                progressPercent: true
            }
        });

        const progressMap = new Map(progressStats.map(s => [s.courseId, s._avg.progressPercent || 0]));

        return courses.map(c => {
            const enrollmentCount = c._count.enrollments;
            const effectivePrice = c.discountPrice !== null && c.discountPrice !== undefined
                ? c.discountPrice
                : (c.price || 0);

            return {
                id: c.id,
                title: c.title,
                enrollments: enrollmentCount,
                revenue: enrollmentCount * effectivePrice,
                averageProgress: progressMap.get(c.id) || 0
            };
        });
    }

    async getCategoryDistribution() {
        const categories = await prisma.lmsCategory.findMany({
            include: {
                courses: {
                    select: {
                        _count: {
                            select: { enrollments: true }
                        }
                    }
                }
            }
        });

        return categories.map(c => ({
            categoryId: c.id,
            categoryName: c.name,
            courseCount: c.courses.length,
            enrollmentCount: c.courses.reduce((sum, course) => sum + course._count.enrollments, 0)
        }));
    }
}

export const analyticsService = new AnalyticsService();