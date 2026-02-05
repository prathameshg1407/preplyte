import { prisma } from '../../../../lib/db';
import { CreateCourseDto, UpdateCourseDto } from './course.validation';
import { AppError } from '../../../../utils/errors';

export class CourseService {
    async create(input: CreateCourseDto) {
        const { modules, finalTest, ...data } = input;

        const existing = await prisma.lmsCourse.findUnique({ where: { slug: data.slug } });
        if (existing) {
            throw new AppError('CONFLICT', 'Course with this slug already exists', 409);
        }

        // Prepare nested modules and their topics/tests
        const modulesCreate = modules?.map((m) => ({
            title: m.title,
            shortDescription: m.shortDescription,
            description: m.description,
            order: m.order,
            points: m.points,
            estimatedMinutes: m.estimatedMinutes,
            isActive: m.isActive,
            topics: m.topics ? {
                create: m.topics.map(t => ({
                    title: t.title,
                    description: t.description,
                    order: t.order,
                    theoryContent: t.theoryContent,
                    videoUrl: t.videoUrl,
                    videoDuration: t.videoDuration,
                    estimatedMinutes: t.estimatedMinutes,
                    isActive: t.isActive
                }))
            } : undefined,
            moduleTest: m.moduleTest ? {
                create: {
                    title: m.moduleTest.title,
                    instructions: m.moduleTest.instructions,
                    totalQuestions: m.moduleTest.totalQuestions,
                    passingScore: m.moduleTest.passingScore,
                    timeLimitMinutes: m.moduleTest.timeLimitMinutes,
                    maxAttempts: m.moduleTest.maxAttempts,
                    pointsPerQuestion: m.moduleTest.pointsPerQuestion,
                    isActive: m.moduleTest.isActive
                }
            } : undefined
        }));

        return prisma.lmsCourse.create({
            data: {
                ...data,
                modules: modulesCreate ? {
                    create: modulesCreate
                } : undefined,
                finalTest: finalTest ? {
                    create: {
                        title: finalTest.title,
                        instructions: finalTest.instructions,
                        totalQuestions: finalTest.totalQuestions,
                        passingScore: finalTest.passingScore,
                        timeLimitMinutes: finalTest.timeLimitMinutes,
                        maxAttempts: finalTest.maxAttempts,
                        pointsPerQuestion: finalTest.pointsPerQuestion,
                        isActive: finalTest.isActive
                    }
                } : undefined
            },
            include: {
                category: true,
                modules: true,
                finalTest: true
            },
        });
    }

    async findAll() {
        return prisma.lmsCourse.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                _count: {
                    select: {
                        modules: true,
                        enrollments: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const course = await prisma.lmsCourse.findUnique({
            where: { id },
            include: {
                category: true,
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        topics: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        if (!course) {
            throw new AppError('NOT_FOUND', 'Course not found', 404);
        }

        return course;
    }

    async update(id: string, input: UpdateCourseDto) {
        await this.findOne(id);

        const { modules, finalTest, ...data } = input;

        if (data.slug) {
            const existing = await prisma.lmsCourse.findUnique({ where: { slug: data.slug } });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Slug already taken', 409);
            }
        }

        // Note: For simplicity, nested update of modules/tests is not implemented here.
        // Usually curriculum is managed through separate endpoints or specific logic.

        return prisma.lmsCourse.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
    }

    async delete(id: string) {
        await this.findOne(id);
        return prisma.lmsCourse.delete({
            where: { id },
        });
    }
}

export const courseService = new CourseService();