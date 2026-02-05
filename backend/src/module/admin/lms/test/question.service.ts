import { prisma } from '../../../../lib/db';
import { AppError } from '../../../../utils/errors';

export class QuestionService {
    async create(data: any) {
        const { options, ...rest } = data;

        return await prisma.$transaction(async (tx) => {
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
    }

    async update(id: string, data: any) {
        const { options, ...rest } = data;

        return await prisma.$transaction(async (tx) => {
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
    }

    async delete(id: string) {
        return await prisma.lmsTestQuestion.delete({
            where: { id }
        });
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
