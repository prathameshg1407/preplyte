import { prisma } from '../../../lib/db';

export interface InstituteStudentsResult {
  students: any[];  // Match frontend InstituteStudent
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getInstituteStudents(
  instituteId: string,
  filters: any  // Match frontend filters
): Promise<InstituteStudentsResult> {
  const { page = 1, limit = 10, ...whereFilters } = filters;
  const skip = (page - 1) * limit;

  const where: any = {
    instituteId,
    role: 'USER',
  };

  // Add filters
  if (whereFilters.isActive !== undefined) where.isActive = whereFilters.isActive;
  if (whereFilters.search) {
    where.OR = [
      { name: { contains: whereFilters.search, mode: 'insensitive' } },
      { email: { contains: whereFilters.search, mode: 'insensitive' } },
    ];
  }
  if (whereFilters.department) where.profile = { department: whereFilters.department };
  if (whereFilters.minCgpa) where.profile = { ...where.profile, averageCgpa: { gte: whereFilters.minCgpa } };

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        _count: {
          select: {
            aptitudeSessions: true,
            machineSessions: true,
            aiInterviewSessions: true,
            mockDriveRegistrations: true,
          },
        },
      },
      orderBy: whereFilters.sortBy ? { [whereFilters.sortBy]: whereFilters.sortOrder } : { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
