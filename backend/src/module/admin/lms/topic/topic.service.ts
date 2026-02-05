import { prisma } from '../../../../lib/db';
import { CreateTopicDto, UpdateTopicDto } from './topic.validation';
import { AppError } from '../../../../utils/errors';

export class TopicService {
    async create(data: CreateTopicDto) {
        const existing = await prisma.lmsTopic.findUnique({
            where: {
                moduleId_order: {
                    moduleId: data.moduleId,
                    order: data.order,
                },
            },
        });

        if (existing) {
            throw new AppError('CONFLICT', 'A topic with this order already exists in the module', 409);
        }

        return prisma.lmsTopic.create({
            data,
        });
    }

    async findOne(id: string) {
        const topic = await prisma.lmsTopic.findUnique({
            where: { id },
        });

        if (!topic) {
            throw new AppError('NOT_FOUND', 'Topic not found', 404);
        }

        return topic;
    }

    async update(id: string, data: UpdateTopicDto) {
        await this.findOne(id);

        if (data.moduleId && data.order) {
            const existing = await prisma.lmsTopic.findUnique({
                where: { moduleId_order: { moduleId: data.moduleId, order: data.order } }
            });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Order conflict in module', 409);
            }
        }

        return prisma.lmsTopic.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        await this.findOne(id);
        return prisma.lmsTopic.delete({
            where: { id },
        });
    }

    async findByModule(moduleId: string) {
        return prisma.lmsTopic.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' },
        });
    }
}


export const topicService = new TopicService();