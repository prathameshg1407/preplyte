import { prisma } from '../../../../lib/db';
import { AppError } from '../../../../utils/errors';
import {
    CreateModuleTestDto,
    UpdateModuleTestDto,
    CreateFinalTestDto,
    UpdateFinalTestDto,
} from './test.validation';
import { courseService } from '../course/course.service';



export class TestService {
    // ==================== Module Tests ====================

    async createModuleTest(data: CreateModuleTestDto) {
        // Verify module exists
        const module = await prisma.lmsModule.findUnique({
            where: { id: data.moduleId },
        });

        if (!module) {
            throw new AppError('NOT_FOUND', 'Module not found', 404);
        }

        const totalPoints = data.totalQuestions * data.pointsPerQuestion;

        const test = await prisma.lmsModuleTest.create({
            data: {
                moduleId: data.moduleId,
                title: data.title,
                instructions: data.instructions,
                totalQuestions: data.totalQuestions,
                passingScore: data.passingScore,
                timeLimitMinutes: data.timeLimitMinutes,
                maxAttempts: data.maxAttempts,
                pointsPerQuestion: data.pointsPerQuestion,
                totalPoints,
                isActive: data.isActive ?? true,
            },
            include: {
                module: {
                    select: {
                        title: true,
                        courseId: true,
                    },
                },
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
            },
        });

        // Sync course stats
        await courseService.syncCourseStats(test.module.courseId);

        return test;
    }

    async getModuleTestById(testId: string) {
        const test = await prisma.lmsModuleTest.findUnique({
            where: { id: testId },
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Module test not found', 404);
        }

        return test;
    }

    async getModuleTestsByModule(moduleId: string) {
        return await prisma.lmsModuleTest.findMany({
            where: { moduleId },
            include: {
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateModuleTest(testId: string, data: UpdateModuleTestDto) {
        const test = await prisma.lmsModuleTest.findUnique({
            where: { id: testId },
            include: { module: true }
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Module test not found', 404);
        }

        let totalPoints = test.totalPoints;
        if (data.totalQuestions !== undefined || data.pointsPerQuestion !== undefined) {
            const questions = data.totalQuestions ?? test.totalQuestions;
            const points = data.pointsPerQuestion ?? test.pointsPerQuestion;
            totalPoints = questions * points;
        }

        const updated = await prisma.lmsModuleTest.update({
            where: { id: testId },
            data: { ...data, totalPoints },
            include: {
                module: true,
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
            },
        });

        // Sync course stats
        await courseService.syncCourseStats(updated.module.courseId);

        return updated;
    }

    async deleteModuleTest(testId: string) {
        const test = await prisma.lmsModuleTest.findUnique({
            where: { id: testId },
            include: { module: true }
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Module test not found', 404);
        }

        const courseId = test.module.courseId;

        // Delete all questions first
        await prisma.lmsTestQuestion.deleteMany({
            where: { moduleTestId: testId },
        });

        // Delete the test
        const deleted = await prisma.lmsModuleTest.delete({
            where: { id: testId },
        });

        // Sync course stats
        await courseService.syncCourseStats(courseId);

        return deleted;
    }

    // ==================== Final Tests ====================

    async createFinalTest(data: CreateFinalTestDto) {
        // Verify course exists
        const course = await prisma.lmsCourse.findUnique({
            where: { id: data.courseId },
        });

        if (!course) {
            throw new AppError('NOT_FOUND', 'Course not found', 404);
        }

        const totalPoints = data.totalQuestions * data.pointsPerQuestion;

        const test = await prisma.lmsFinalTest.create({
            data: {
                courseId: data.courseId,
                title: data.title,
                instructions: data.instructions,
                totalQuestions: data.totalQuestions,
                passingScore: data.passingScore,
                timeLimitMinutes: data.timeLimitMinutes,
                maxAttempts: data.maxAttempts,
                pointsPerQuestion: data.pointsPerQuestion,
                totalPoints,
                isActive: data.isActive ?? true,
            },
            include: {
                course: {
                    select: {
                        title: true,
                    },
                },
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
            },
        });

        // Sync course stats
        await courseService.syncCourseStats(test.courseId);

        return test;
    }

    async getFinalTestById(testId: string) {
        const test = await prisma.lmsFinalTest.findUnique({
            where: { id: testId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Final test not found', 404);
        }

        return test;
    }

    async getFinalTestsByCourse(courseId: string) {
        return await prisma.lmsFinalTest.findMany({
            where: { courseId },
            include: {
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateFinalTest(testId: string, data: UpdateFinalTestDto) {
        const test = await prisma.lmsFinalTest.findUnique({
            where: { id: testId },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Final test not found', 404);
        }

        let totalPoints = test.totalPoints;
        if (data.totalQuestions !== undefined || data.pointsPerQuestion !== undefined) {
            const questions = data.totalQuestions ?? test.totalQuestions;
            const points = data.pointsPerQuestion ?? test.pointsPerQuestion;
            totalPoints = questions * points;
        }

        const updated = await prisma.lmsFinalTest.update({
            where: { id: testId },
            data: { ...data, totalPoints },
            include: {
                course: true,
                questions: {
                    include: { options: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
            },
        });

        // Sync course stats
        await courseService.syncCourseStats(updated.courseId);

        return updated;
    }

    async deleteFinalTest(testId: string) {
        const test = await prisma.lmsFinalTest.findUnique({
            where: { id: testId },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Final test not found', 404);
        }

        const courseId = test.courseId;

        // Delete all questions first
        await prisma.lmsTestQuestion.deleteMany({
            where: { finalTestId: testId },
        });

        // Delete the test
        const deleted = await prisma.lmsFinalTest.delete({
            where: { id: testId },
        });

        // Sync course stats
        await courseService.syncCourseStats(courseId);

        return deleted;
    }
}

export const testService = new TestService();
