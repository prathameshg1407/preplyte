// backend/src/module/admin/lms/category/category.types.ts

export interface CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    order?: number;
    isActive?: boolean;
}

export interface UpdateCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    iconUrl?: string;
    order?: number;
    isActive?: boolean;
}

export interface CategoryFilters {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'order' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface CategoryWithStats {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        courses: number;
    };
    totalEnrollments: number;
}