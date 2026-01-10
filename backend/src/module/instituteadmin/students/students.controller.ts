import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import * as studentsService from './students.service';
import { validate } from '../../../middleware/validate.middleware';
import { getInstituteStudentsSchema } from './students.validation';

export const getInstituteStudents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get instituteId from authenticated user (set by parent router's authenticate middleware)
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
      return;
    }

    const instituteId = req.user.instituteId;
    
    if (!instituteId) {
      res.status(403).json({ 
        success: false,
        message: 'Institute context required' 
      });
      return;
    }

    // ✅ Fix: Ensure non-null (authorizeInstituteAdmin guarantees it)
    const filters = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: (req.query.search as string) || '',
      departmentId: (req.query.departmentId as string) || '',
      courseYear: (req.query.courseYear as string) || '',
      minCgpa: req.query.minCgpa ? Number(req.query.minCgpa) : undefined,
      isActive: req.query.isActive ? (req.query.isActive === 'true') : undefined,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as string) || 'desc',
    };

    const result = await studentsService.getInstituteStudents(instituteId, filters);  // ✅ Remove ! 

    // Transform pagination to match PaginationMeta format
    const pagination = {
      currentPage: result.pagination.page,
      totalPages: result.pagination.totalPages,
      totalItems: result.pagination.total,
      itemsPerPage: result.pagination.limit,
      hasNextPage: result.pagination.page < result.pagination.totalPages,
      hasPreviousPage: result.pagination.page > 1,
    };

    res.status(200).json({
      success: true,
      data: {
        students: result.students,
        pagination,
      },
    });
  } catch (error) {
    throw error;  // ✅ Global error handler catches this
  }
};

export const validateGetInstituteStudents = validate(getInstituteStudentsSchema);
