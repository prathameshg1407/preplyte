import { prisma } from '../../../../lib/db';
import { CreateCategoryDto, UpdateCategoryDto } from './category.validation';
import { AppError } from '../../../../utils/errors';

export class CategoryService {
    async create(data: CreateCategoryDto) {
        const existing = await prisma.lmsCategory.findUnique({ where: { slug: data.slug } });
        if (existing) {
            throw new AppError('CONFLICT', 'Category with this slug already exists', 409);
        }

        return prisma.lmsCategory.create({
            data,
        });
    }

    async findAll() {
        return prisma.lmsCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { courses: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const category = await prisma.lmsCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { courses: true },
                },
            },
        });

        if (!category) {
            throw new AppError('NOT_FOUND', 'Category not found', 404);
        }

        return category;
    }

    async update(id: string, data: UpdateCategoryDto) {
        await this.findOne(id); // Ensure exists

        if (data.slug) {
            const existing = await prisma.lmsCategory.findUnique({ where: { slug: data.slug } });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Slug already taken', 409);
            }
        }

        return prisma.lmsCategory.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        await this.findOne(id);

        // Check if courses exist (Prisma onDelete: Restict will throw, but custom message is nice)
        // We let Prisma throw specific foreign key error or check manually.
        // Given schema says onDelete: Restict.

        return prisma.lmsCategory.delete({
            where: { id },
        });
    }
}

export const categoryService = new CategoryService();