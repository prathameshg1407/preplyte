import { prisma } from '../../../../lib/db';
import { AppError } from '../../../../utils/errors';
import { courseService } from '../course/course.service';

export class QuestionService {
    async create(data: any) {
        const { options, ...rest } = data;

        const result = await prisma.$transaction(async (tx) => {
            const question = await tx.lmsTestQuestion.create({
                data: {
                    ...rest,
                    options: {
                        create: options.map((opt: any) => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect,
                            order: opt.order
                        }))
                    }
                },
                include: {
                    options: true
                }
            });
            return question;
        });

        // Sync stats
        await this.syncAfterChange(result.moduleTestId, result.finalTestId);

        return result;
    }

    async update(id: string, data: any) {
        const { options, ...rest } = data;

        const result = await prisma.$transaction(async (tx) => {
            // Delete old options if new ones are provided
            if (options) {
                await tx.lmsTestOption.deleteMany({
                    where: { questionId: id }
                });
            }

            const question = await tx.lmsTestQuestion.update({
                where: { id },
                data: {
                    ...rest,
                    ...(options && {
                        options: {
                            create: options.map((opt: any) => ({
                                text: opt.text,
                                isCorrect: opt.isCorrect,
                                order: opt.order
                            }))
                        }
                    })
                },
                include: {
                    options: true
                }
            });
            return question;
        });

        // Sync stats
        await this.syncAfterChange(result.moduleTestId, result.finalTestId);

        return result;
    }

    async delete(id: string) {
        const question = await prisma.lmsTestQuestion.findUnique({
            where: { id }
        });

        if (!question) return;

        const deleted = await prisma.lmsTestQuestion.delete({
            where: { id }
        });

        // Sync stats
        await this.syncAfterChange(question.moduleTestId, question.finalTestId);

        return deleted;
    }

    private async syncAfterChange(moduleTestId: string | null, finalTestId: string | null) {
        let courseId: string | null = null;

        if (moduleTestId) {
            const moduleTest = await prisma.lmsModuleTest.findUnique({
                where: { id: moduleTestId },
                include: { module: { select: { courseId: true } } }
            });
            courseId = moduleTest?.module.courseId || null;
        } else if (finalTestId) {
            const finalTest = await prisma.lmsFinalTest.findUnique({
                where: { id: finalTestId },
                select: { courseId: true }
            });
            courseId = finalTest?.courseId || null;
        }

        if (courseId) {
            await courseService.syncCourseStats(courseId);
        }
    }

    async getById(id: string) {
        const question = await prisma.lmsTestQuestion.findUnique({
            where: { id },
            include: {
                options: true
            }
        });
        if (!question) throw new AppError('NOT_FOUND', 'Question not found', 404);
        return question;
    }
}

export const questionService = new QuestionService();
