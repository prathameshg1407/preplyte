import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { adminService, AdminErrors } from './admin.service';
import { sendSuccess, sendError, createPaginationMeta } from '../../utils/response';
import { logger } from '../../utils/logger';
import {
  instituteFiltersSchema,
  instituteStudentsSchema,
  userFiltersSchema,
  reportFiltersSchema,
  dateRangeSchema,
} from './admin.validation';

// =====================================================
// ERROR HANDLING
// =====================================================

const ERROR_MAP: Record<string, { code: string; message: string; status: number }> = {
  [AdminErrors.INSTITUTE_NOT_FOUND]: { code: 'NOT_FOUND', message: 'Institute not found', status: 404 },
  [AdminErrors.INSTITUTE_DOMAIN_EXISTS]: { code: 'CONFLICT', message: 'Domain already exists', status: 409 },
  [AdminErrors.INSTITUTE_HAS_USERS]: { code: 'BAD_REQUEST', message: 'Cannot delete institute with users', status: 400 },
  [AdminErrors.USER_NOT_FOUND]: { code: 'NOT_FOUND', message: 'User not found', status: 404 },
  [AdminErrors.USER_EMAIL_EXISTS]: { code: 'CONFLICT', message: 'Email already exists', status: 409 },
  [AdminErrors.CANNOT_DELETE_PLATFORM_ADMIN]: { code: 'FORBIDDEN', message: 'Cannot delete platform admin', status: 403 },
  [AdminErrors.CANNOT_MODIFY_PLATFORM_ADMIN]: { code: 'FORBIDDEN', message: 'Cannot modify platform admin', status: 403 },
};

function handleError(res: Response, error: unknown, next: NextFunction): void {
  if (error instanceof Error) {
    const mapped = ERROR_MAP[error.message];
    if (mapped) {
      sendError(res, mapped.code, mapped.message, mapped.status);
      return;
    }
  }
  next(error);
}

// =====================================================
// CSV HELPER
// =====================================================

function sendCsv(res: Response, data: Record<string, unknown>[], filename: string): void {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  if (!data.length) {
    res.send('');
    return;
  }

  const headers = Object.keys(data[0]);
  const escape = (val: unknown): string => {
    if (val == null) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];

  res.send(rows.join('\n'));
}

// =====================================================
// ANALYTICS
// =====================================================

export async function getPlatformAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = dateRangeSchema.parse({ query: req.query });
    const dateRange =
      query.startDate && query.endDate
        ? { startDate: new Date(query.startDate), endDate: new Date(query.endDate) }
        : undefined;

    const analytics = await adminService.getPlatformAnalytics(dateRange);
    sendSuccess(res, analytics);
  } catch (error) {
    next(error);
  }
}

// =====================================================
// INSTITUTES
// =====================================================

export async function listInstitutes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = instituteFiltersSchema.parse({ query: req.query });
    const result = await adminService.listInstitutes(query);
    const pagination = createPaginationMeta(result.page, result.limit, result.total);
    sendSuccess(res, { institutes: result.institutes, pagination });
  } catch (error) {
    next(error);
  }
}

export async function getInstitute(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institute = await adminService.getInstitute(req.params.id);
    sendSuccess(res, institute);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function createInstitute(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institute = await adminService.createInstitute(req.body);
    logger.info(`Institute created: ${institute.id}`, { adminId: req.user?.id });
    sendSuccess(res, institute, 'Institute created', 201);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function updateInstitute(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institute = await adminService.updateInstitute(req.params.id, req.body);
    logger.info(`Institute updated: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, institute);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function deleteInstitute(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await adminService.deleteInstitute(req.params.id);
    logger.info(`Institute deleted: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, null, 'Institute deleted');
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function toggleInstituteStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institute = await adminService.toggleInstituteStatus(req.params.id);
    logger.info(`Institute status toggled: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, institute);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function getInstituteStudents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { params, query } = instituteStudentsSchema.parse({ params: req.params, query: req.query });
    const result = await adminService.getInstituteStudents(params.id, query);
    const pagination = createPaginationMeta(result.page, result.limit, result.total);
    sendSuccess(res, { students: result.students, pagination });
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function getInstituteAdmins(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admins = await adminService.getInstituteAdmins(req.params.id);
    sendSuccess(res, admins);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function getInstituteStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getInstituteStats(req.params.id);
    sendSuccess(res, stats);
  } catch (error) {
    handleError(res, error, next);
  }
}

// =====================================================
// USERS
// =====================================================

export async function listUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = userFiltersSchema.parse({ query: req.query });
    const result = await adminService.listUsers(query);
    const pagination = createPaginationMeta(result.page, result.limit, result.total);
    sendSuccess(res, { users: result.users, pagination });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await adminService.getUser(req.params.id);
    sendSuccess(res, user);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function createUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await adminService.createUser(req.body);
    logger.info(`User created: ${user.id}`, { adminId: req.user?.id });
    sendSuccess(res, user, 'User created', 201);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function updateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    logger.info(`User updated: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, user);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await adminService.deleteUser(req.params.id);
    logger.info(`User deleted: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, null, 'User deleted');
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function toggleUserStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    logger.info(`User status toggled: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, user);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function getUserStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getUserStats(req.params.id);
    sendSuccess(res, stats);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function resetUserPassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await adminService.resetUserPassword(req.params.id, req.body.newPassword);
    logger.info(`User password reset: ${req.params.id}`, { adminId: req.user?.id });
    sendSuccess(res, null, 'Password reset');
  } catch (error) {
    handleError(res, error, next);
  }
}

// =====================================================
// REPORTS
// =====================================================

export async function getInstitutesReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = reportFiltersSchema.parse({ query: req.query });
    const report = await adminService.getInstitutesReport(query);

    if (query.format === 'csv') {
      sendCsv(res, report.institutes as unknown as Record<string, unknown>[], 'institutes.csv');
      return;
    }

    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
}

export async function getUsersReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = reportFiltersSchema.parse({ query: req.query });
    const report = await adminService.getUsersReport(query);

    if (query.format === 'csv') {
      sendCsv(res, report.users as unknown as Record<string, unknown>[], 'users.csv');
      return;
    }

    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
}

export async function getActivityReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = reportFiltersSchema.parse({ query: req.query });
    const report = await adminService.getActivityReport(query);

    if (query.format === 'csv') {
      sendCsv(res, report.activities as unknown as Record<string, unknown>[], 'activity.csv');
      return;
    }

    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
}