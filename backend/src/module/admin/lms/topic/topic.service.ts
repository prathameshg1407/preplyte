import { prisma } from '../../../../lib/db';
import { CreateTopicDto, UpdateTopicDto } from './topic.validation';
import { AppError } from '../../../../utils/errors';
import { courseService } from '../course/course.service';

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

        const topic = await prisma.lmsTopic.create({
            data: {
                ...data,
                theoryContent: data.theoryContent || '',
            },
        });

        // Get courseId to sync stats
        const module = await prisma.lmsModule.findUnique({
            where: { id: data.moduleId },
            select: { courseId: true }
        });

        if (module) {
            await courseService.syncCourseStats(module.courseId);
        }

        return topic;
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
        const topic = await this.findOne(id);

        if (data.moduleId && data.order) {
            const existing = await prisma.lmsTopic.findUnique({
                where: { moduleId_order: { moduleId: data.moduleId || topic.moduleId, order: data.order } }
            });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Order conflict in module', 409);
            }
        }

        const updated = await prisma.lmsTopic.update({
            where: { id },
            data: {
                ...data,
                theoryContent: data.theoryContent === null ? '' : data.theoryContent,
            },
        });

        const module = await prisma.lmsModule.findUnique({
            where: { id: updated.moduleId },
            select: { courseId: true }
        });

        if (module) {
            await courseService.syncCourseStats(module.courseId);
        }

        return updated;
    }

    async delete(id: string) {
        const topic = await this.findOne(id);
        const deleted = await prisma.lmsTopic.delete({
            where: { id },
        });

        const module = await prisma.lmsModule.findUnique({
            where: { id: topic.moduleId },
            select: { courseId: true }
        });

        if (module) {
            await courseService.syncCourseStats(module.courseId);
        }

        return deleted;
    }

    async findByModule(moduleId: string) {
        return prisma.lmsTopic.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' },
        });
    }
}


export const topicService = new TopicService();