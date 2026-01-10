// src/module/instituteadmin/department/department.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/db';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from '../../../utils/errors';
import { logger } from '../../../utils/logger';
import {
  DepartmentResponse,
  DepartmentListResponse,
  DepartmentStats,
  BulkCreateResult,
  mapDepartmentToResponse,
  DepartmentWithCount,
} from './department.types';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentQueryParams,
} from './department.validation';

// =====================================================
// SERVICE CLASS
// =====================================================

class DepartmentService {
  // =================================================
  // CREATE DEPARTMENT
  // =================================================

  async createDepartment(
    instituteId: string,
    input: CreateDepartmentInput
  ): Promise<DepartmentResponse> {
    logger.info('[DepartmentService] Creating department', {
      instituteId,
      name: input.name,
    });

    // Check for duplicate name
    const existingName = await prisma.department.findFirst({
      where: {
        instituteId,
        name: {
          equals: input.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingName) {
      throw new ConflictError(`Department "${input.name}" already exists`);
    }

    // Check for duplicate code if provided
    if (input.code) {
      const existingCode = await prisma.department.findFirst({
        where: {
          instituteId,
          code: input.code.toUpperCase(),
        },
      });

      if (existingCode) {
        throw new ConflictError(`Department code "${input.code}" already exists`);
      }
    }

    const department = await prisma.department.create({
      data: {
        instituteId,
        name: input.name,
        code: input.code?.toUpperCase(),
        description: input.description,
        isActive: input.isActive ?? true,
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    logger.info('[DepartmentService] Department created', {
      departmentId: department.id,
      instituteId,
    });

    return mapDepartmentToResponse(department);
  }

  // =================================================
  // GET DEPARTMENTS (LIST)
  // =================================================

  async getDepartments(
    instituteId: string,
    params: DepartmentQueryParams
  ): Promise<DepartmentListResponse> {
    logger.debug('[DepartmentService] Fetching departments', {
      instituteId,
      params,
    });

    const { page, limit, search, isActive, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DepartmentWhereInput = {
      instituteId,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Build order by
    let orderBy: Prisma.DepartmentOrderByWithRelationInput | Prisma.DepartmentOrderByWithRelationInput[];

    if (sortBy === 'studentCount') {
      orderBy = {
        students: {
          _count: sortOrder,
        },
      };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Execute queries
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          _count: {
            select: { students: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.department.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      departments: departments.map(mapDepartmentToResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  // =================================================
  // GET SINGLE DEPARTMENT
  // =================================================

  async getDepartment(
    instituteId: string,
    departmentId: string
  ): Promise<DepartmentResponse> {
    logger.debug('[DepartmentService] Fetching department', {
      instituteId,
      departmentId,
    });

    const department = await this.findDepartmentOrThrow(instituteId, departmentId);
    return mapDepartmentToResponse(department);
  }

  // =================================================
  // UPDATE DEPARTMENT
  // =================================================

  async updateDepartment(
    instituteId: string,
    departmentId: string,
    input: UpdateDepartmentInput
  ): Promise<DepartmentResponse> {
    logger.info('[DepartmentService] Updating department', {
      instituteId,
      departmentId,
    });

    const existing = await this.findDepartmentOrThrow(instituteId, departmentId);

    // Check for duplicate name if updating
    if (input.name && input.name !== existing.name) {
      const duplicateName = await prisma.department.findFirst({
        where: {
          instituteId,
          name: {
            equals: input.name,
            mode: 'insensitive',
          },
          id: { not: departmentId },
        },
      });

      if (duplicateName) {
        throw new ConflictError(`Department "${input.name}" already exists`);
      }
    }

    // Check for duplicate code if updating
    if (input.code && input.code !== existing.code) {
      const duplicateCode = await prisma.department.findFirst({
        where: {
          instituteId,
          code: input.code.toUpperCase(),
          id: { not: departmentId },
        },
      });

      if (duplicateCode) {
        throw new ConflictError(`Department code "${input.code}" already exists`);
      }
    }

    const department = await prisma.department.update({
      where: { id: departmentId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.code !== undefined && { code: input.code?.toUpperCase() ?? null }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    logger.info('[DepartmentService] Department updated', { departmentId });

    return mapDepartmentToResponse(department);
  }

  // =================================================
  // DELETE DEPARTMENT
  // =================================================

  async deleteDepartment(
    instituteId: string,
    departmentId: string
  ): Promise<void> {
    logger.info('[DepartmentService] Deleting department', {
      instituteId,
      departmentId,
    });

    const department = await this.findDepartmentOrThrow(instituteId, departmentId);

    // Check if department has students
    if (department._count && department._count.students > 0) {
      throw new BadRequestError(
        `Cannot delete department with ${department._count.students} student(s). ` +
          'Please reassign or remove students first.'
      );
    }

    await prisma.department.delete({
      where: { id: departmentId },
    });

    logger.info('[DepartmentService] Department deleted', { departmentId });
  }

  // =================================================
  // TOGGLE STATUS
  // =================================================

  async toggleStatus(
    instituteId: string,
    departmentId: string,
    isActive: boolean
  ): Promise<DepartmentResponse> {
    logger.info('[DepartmentService] Toggling department status', {
      instituteId,
      departmentId,
      isActive,
    });

    await this.findDepartmentOrThrow(instituteId, departmentId);

    const department = await prisma.department.update({
      where: { id: departmentId },
      data: { isActive },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    logger.info('[DepartmentService] Department status toggled', {
      departmentId,
      isActive,
    });

    return mapDepartmentToResponse(department);
  }

  // =================================================
  // BULK CREATE
  // =================================================

  async bulkCreateDepartments(
    instituteId: string,
    departments: CreateDepartmentInput[]
  ): Promise<BulkCreateResult> {
    logger.info('[DepartmentService] Bulk creating departments', {
      instituteId,
      count: departments.length,
    });

    const result: BulkCreateResult = {
      created: 0,
      failed: 0,
      errors: [],
    };

    // Get existing departments for duplicate check
    const existingDepartments = await prisma.department.findMany({
      where: { instituteId },
      select: { name: true, code: true },
    });

    const existingNames = new Set(
      existingDepartments.map((d) => d.name.toLowerCase())
    );
    const existingCodes = new Set(
      existingDepartments.filter((d) => d.code).map((d) => d.code!.toLowerCase())
    );

    // Track names/codes being added in this batch
    const batchNames = new Set<string>();
    const batchCodes = new Set<string>();

    const toCreate: Prisma.DepartmentCreateManyInput[] = [];

    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const nameLower = dept.name.toLowerCase();
      const codeLower = dept.code?.toLowerCase();

      // Check for duplicates
      if (existingNames.has(nameLower) || batchNames.has(nameLower)) {
        result.failed++;
        result.errors.push({
          index: i,
          name: dept.name,
          error: `Department "${dept.name}" already exists`,
        });
        continue;
      }

      if (codeLower && (existingCodes.has(codeLower) || batchCodes.has(codeLower))) {
        result.failed++;
        result.errors.push({
          index: i,
          name: dept.name,
          error: `Department code "${dept.code}" already exists`,
        });
        continue;
      }

      batchNames.add(nameLower);
      if (codeLower) batchCodes.add(codeLower);

      toCreate.push({
        instituteId,
        name: dept.name,
        code: dept.code?.toUpperCase(),
        description: dept.description,
        isActive: dept.isActive ?? true,
      });
    }

    if (toCreate.length > 0) {
      await prisma.department.createMany({
        data: toCreate,
      });
      result.created = toCreate.length;
    }

    logger.info('[DepartmentService] Bulk create completed', {
      instituteId,
      created: result.created,
      failed: result.failed,
    });

    return result;
  }

  // =================================================
  // GET STATISTICS
  // =================================================

  async getStats(instituteId: string): Promise<DepartmentStats> {
    logger.debug('[DepartmentService] Fetching department stats', {
      instituteId,
    });

    const [departments, totalStudents] = await Promise.all([
      prisma.department.findMany({
        where: { instituteId },
        include: {
          _count: {
            select: { students: true },
          },
        },
        orderBy: {
          students: {
            _count: 'desc',
          },
        },
      }),
      prisma.studentProfile.count({
        where: {
          department: {
            instituteId,
          },
        },
      }),
    ]);

    const activeDepartments = departments.filter((d) => d.isActive).length;

    return {
      totalDepartments: departments.length,
      activeDepartments,
      inactiveDepartments: departments.length - activeDepartments,
      totalStudents,
      departmentWiseStudents: departments.map((d) => ({
        departmentId: d.id,
        departmentName: d.name,
        departmentCode: d.code,
        studentCount: d._count?.students ?? 0,
      })),
    };
  }

  // =================================================
  // GET ALL ACTIVE (for dropdowns)
  // =================================================

  async getActiveDepartments(
    instituteId: string
  ): Promise<{ id: string; name: string; code: string | null }[]> {
    const departments = await prisma.department.findMany({
      where: {
        instituteId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });

    return departments;
  }

  // =================================================
  // PRIVATE HELPERS
  // =================================================

  private async findDepartmentOrThrow(
    instituteId: string,
    departmentId: string
  ): Promise<DepartmentWithCount> {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        instituteId,
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundError('Department');
    }

    return department;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const departmentService = new DepartmentService();
export { DepartmentService };