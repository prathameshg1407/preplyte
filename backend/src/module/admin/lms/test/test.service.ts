import { prisma } from '../../../../lib/db';
import { AppError } from '../../../../utils/errors';
import {
    CreateModuleTestDto,
    UpdateModuleTestDto,
    CreateFinalTestDto,
    UpdateFinalTestDto,
} from './test.validation';



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

        return await prisma.lmsModuleTest.create({
            data: {
                moduleId: data.moduleId,
                title: data.title,
                instructions: data.instructions,
                totalQuestions: data.totalQuestions,
                passingScore: data.passingScore,
                timeLimitMinutes: data.timeLimitMinutes,
                maxAttempts: data.maxAttempts,
                pointsPerQuestion: data.pointsPerQuestion,
                isActive: data.isActive ?? true,
            },
            include: {
                module: {
                    select: {
                        title: true,
                        courseId: true,
                    },
                },
                questions: true,
            },
        });
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
                questions: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateModuleTest(testId: string, data: UpdateModuleTestDto) {
        const test = await prisma.lmsModuleTest.findUnique({
            where: { id: testId },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Module test not found', 404);
        }

        return await prisma.lmsModuleTest.update({
            where: { id: testId },
            data,
            include: {
                module: true,
                questions: true,
            },
        });
    }

    async deleteModuleTest(testId: string) {
        const test = await prisma.lmsModuleTest.findUnique({
            where: { id: testId },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Module test not found', 404);
        }

        // Delete all questions first
        await prisma.lmsTestQuestion.deleteMany({
            where: { moduleTestId: testId },
        });

        // Delete the test
        return await prisma.lmsModuleTest.delete({
            where: { id: testId },
        });
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

        return await prisma.lmsFinalTest.create({
            data: {
                courseId: data.courseId,
                title: data.title,
                instructions: data.instructions,
                totalQuestions: data.totalQuestions,
                passingScore: data.passingScore,
                timeLimitMinutes: data.timeLimitMinutes,
                maxAttempts: data.maxAttempts,
                pointsPerQuestion: data.pointsPerQuestion,
                isActive: data.isActive ?? true,
            },
            include: {
                course: {
                    select: {
                        title: true,
                    },
                },
                questions: true,
            },
        });
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
                questions: true,
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

        return await prisma.lmsFinalTest.update({
            where: { id: testId },
            data,
            include: {
                course: true,
                questions: true,
            },
        });
    }

    async deleteFinalTest(testId: string) {
        const test = await prisma.lmsFinalTest.findUnique({
            where: { id: testId },
        });

        if (!test) {
            throw new AppError('NOT_FOUND', 'Final test not found', 404);
        }

        // Delete all questions first
        await prisma.lmsTestQuestion.deleteMany({
            where: { finalTestId: testId },
        });

        // Delete the test
        return await prisma.lmsFinalTest.delete({
            where: { id: testId },
        });
    }
}

export const testService = new TestService();