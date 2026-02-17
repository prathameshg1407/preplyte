import { prisma } from '../../../../lib/db';
import { CreateModuleDto, UpdateModuleDto } from './module.validation';
import { AppError } from '../../../../utils/errors';
import { courseService } from '../course/course.service';

export class ModuleService {
    async create(data: CreateModuleDto) {
        // Unique order constraint check?
        // courseId + order is unique.
        const existing = await prisma.lmsModule.findUnique({
            where: {
                courseId_order: {
                    courseId: data.courseId,
                    order: data.order,
                },
            },
        });

        if (existing) {
            throw new AppError('CONFLICT', 'A module with this order already exists in the course', 409);
        }

        const module = await prisma.lmsModule.create({
            data,
        });

        // Sync stats
        await courseService.syncCourseStats(data.courseId);

        return module;
    }

    async findOne(id: string) {
        const module = await prisma.lmsModule.findUnique({
            where: { id },
            include: {
                topics: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!module) {
            throw new AppError('NOT_FOUND', 'Module not found', 404);
        }

        return module;
    }

    async update(id: string, data: UpdateModuleDto) {
        const module = await this.findOne(id);

        if (data.courseId && data.order) {
            // check conflict if changing order/course
            const existing = await prisma.lmsModule.findUnique({
                where: { courseId_order: { courseId: data.courseId || module.courseId, order: data.order } }
            });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Order conflict in course', 409);
            }
        }

        const updated = await prisma.lmsModule.update({
            where: { id },
            data,
        });

        // Sync stats
        await courseService.syncCourseStats(updated.courseId);

        return updated;
    }

    async delete(id: string) {
        const module = await this.findOne(id);
        const deleted = await prisma.lmsModule.delete({
            where: { id },
        });

        // Sync stats
        await courseService.syncCourseStats(module.courseId);

        return deleted;
    }

    async findByCourse(courseId: string) {
        return prisma.lmsModule.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });
    }
}

export const moduleService = new ModuleService();