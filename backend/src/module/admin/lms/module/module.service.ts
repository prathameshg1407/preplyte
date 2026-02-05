import { prisma } from '../../../../lib/db';
import { CreateModuleDto, UpdateModuleDto } from './module.validation';
import { AppError } from '../../../../utils/errors';

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

        return prisma.lmsModule.create({
            data,
        });
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
        await this.findOne(id);

        if (data.courseId && data.order) {
            // check conflict if changing order/course
            const existing = await prisma.lmsModule.findUnique({
                where: { courseId_order: { courseId: data.courseId, order: data.order } }
            });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Order conflict in course', 409);
            }
        }

        return prisma.lmsModule.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        await this.findOne(id);
        return prisma.lmsModule.delete({
            where: { id },
        });
    }

    async findByCourse(courseId: string) {
        return prisma.lmsModule.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });
    }
}

export const moduleService = new ModuleService();