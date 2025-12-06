"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformAnalytics = getPlatformAnalytics;
exports.listInstitutes = listInstitutes;
exports.getInstitute = getInstitute;
exports.createInstitute = createInstitute;
exports.updateInstitute = updateInstitute;
exports.deleteInstitute = deleteInstitute;
exports.toggleInstituteStatus = toggleInstituteStatus;
exports.getInstituteStudents = getInstituteStudents;
exports.getInstituteAdmins = getInstituteAdmins;
exports.getInstituteStats = getInstituteStats;
exports.listUsers = listUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.toggleUserStatus = toggleUserStatus;
exports.getUserStats = getUserStats;
exports.resetUserPassword = resetUserPassword;
exports.getInstitutesReport = getInstitutesReport;
exports.getUsersReport = getUsersReport;
exports.getActivityReport = getActivityReport;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../utils/response");
const logger_1 = require("../../utils/logger");
const admin_validation_1 = require("./admin.validation");
// =====================================================
// ERROR HANDLING
// =====================================================
const ERROR_MAP = {
    [admin_service_1.AdminErrors.INSTITUTE_NOT_FOUND]: { code: 'NOT_FOUND', message: 'Institute not found', status: 404 },
    [admin_service_1.AdminErrors.INSTITUTE_DOMAIN_EXISTS]: { code: 'CONFLICT', message: 'Domain already exists', status: 409 },
    [admin_service_1.AdminErrors.INSTITUTE_HAS_USERS]: { code: 'BAD_REQUEST', message: 'Cannot delete institute with users', status: 400 },
    [admin_service_1.AdminErrors.USER_NOT_FOUND]: { code: 'NOT_FOUND', message: 'User not found', status: 404 },
    [admin_service_1.AdminErrors.USER_EMAIL_EXISTS]: { code: 'CONFLICT', message: 'Email already exists', status: 409 },
    [admin_service_1.AdminErrors.CANNOT_DELETE_PLATFORM_ADMIN]: { code: 'FORBIDDEN', message: 'Cannot delete platform admin', status: 403 },
    [admin_service_1.AdminErrors.CANNOT_MODIFY_PLATFORM_ADMIN]: { code: 'FORBIDDEN', message: 'Cannot modify platform admin', status: 403 },
};
function handleError(res, error, next) {
    if (error instanceof Error) {
        const mapped = ERROR_MAP[error.message];
        if (mapped) {
            (0, response_1.sendError)(res, mapped.code, mapped.message, mapped.status);
            return;
        }
    }
    next(error);
}
// =====================================================
// CSV HELPER
// =====================================================
function sendCsv(res, data, filename) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (!data.length) {
        res.send('');
        return;
    }
    const headers = Object.keys(data[0]);
    const escape = (val) => {
        if (val == null)
            return '';
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
async function getPlatformAnalytics(req, res, next) {
    try {
        const { query } = admin_validation_1.dateRangeSchema.parse({ query: req.query });
        const dateRange = query.startDate && query.endDate
            ? { startDate: new Date(query.startDate), endDate: new Date(query.endDate) }
            : undefined;
        const analytics = await admin_service_1.adminService.getPlatformAnalytics(dateRange);
        (0, response_1.sendSuccess)(res, analytics);
    }
    catch (error) {
        next(error);
    }
}
// =====================================================
// INSTITUTES
// =====================================================
async function listInstitutes(req, res, next) {
    try {
        const { query } = admin_validation_1.instituteFiltersSchema.parse({ query: req.query });
        const result = await admin_service_1.adminService.listInstitutes(query);
        const pagination = (0, response_1.createPaginationMeta)(result.page, result.limit, result.total);
        (0, response_1.sendSuccess)(res, { institutes: result.institutes, pagination });
    }
    catch (error) {
        next(error);
    }
}
async function getInstitute(req, res, next) {
    try {
        const institute = await admin_service_1.adminService.getInstitute(req.params.id);
        (0, response_1.sendSuccess)(res, institute);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function createInstitute(req, res, next) {
    try {
        const institute = await admin_service_1.adminService.createInstitute(req.body);
        logger_1.logger.info(`Institute created: ${institute.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, institute, 'Institute created', 201);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function updateInstitute(req, res, next) {
    try {
        const institute = await admin_service_1.adminService.updateInstitute(req.params.id, req.body);
        logger_1.logger.info(`Institute updated: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, institute);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function deleteInstitute(req, res, next) {
    try {
        await admin_service_1.adminService.deleteInstitute(req.params.id);
        logger_1.logger.info(`Institute deleted: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, null, 'Institute deleted');
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function toggleInstituteStatus(req, res, next) {
    try {
        const institute = await admin_service_1.adminService.toggleInstituteStatus(req.params.id);
        logger_1.logger.info(`Institute status toggled: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, institute);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function getInstituteStudents(req, res, next) {
    try {
        const { params, query } = admin_validation_1.instituteStudentsSchema.parse({ params: req.params, query: req.query });
        const result = await admin_service_1.adminService.getInstituteStudents(params.id, query);
        const pagination = (0, response_1.createPaginationMeta)(result.page, result.limit, result.total);
        (0, response_1.sendSuccess)(res, { students: result.students, pagination });
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function getInstituteAdmins(req, res, next) {
    try {
        const admins = await admin_service_1.adminService.getInstituteAdmins(req.params.id);
        (0, response_1.sendSuccess)(res, admins);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function getInstituteStats(req, res, next) {
    try {
        const stats = await admin_service_1.adminService.getInstituteStats(req.params.id);
        (0, response_1.sendSuccess)(res, stats);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
// =====================================================
// USERS
// =====================================================
async function listUsers(req, res, next) {
    try {
        const { query } = admin_validation_1.userFiltersSchema.parse({ query: req.query });
        const result = await admin_service_1.adminService.listUsers(query);
        const pagination = (0, response_1.createPaginationMeta)(result.page, result.limit, result.total);
        (0, response_1.sendSuccess)(res, { users: result.users, pagination });
    }
    catch (error) {
        next(error);
    }
}
async function getUser(req, res, next) {
    try {
        const user = await admin_service_1.adminService.getUser(req.params.id);
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function createUser(req, res, next) {
    try {
        const user = await admin_service_1.adminService.createUser(req.body);
        logger_1.logger.info(`User created: ${user.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, user, 'User created', 201);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function updateUser(req, res, next) {
    try {
        const user = await admin_service_1.adminService.updateUser(req.params.id, req.body);
        logger_1.logger.info(`User updated: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function deleteUser(req, res, next) {
    try {
        await admin_service_1.adminService.deleteUser(req.params.id);
        logger_1.logger.info(`User deleted: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, null, 'User deleted');
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function toggleUserStatus(req, res, next) {
    try {
        const user = await admin_service_1.adminService.toggleUserStatus(req.params.id);
        logger_1.logger.info(`User status toggled: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function getUserStats(req, res, next) {
    try {
        const stats = await admin_service_1.adminService.getUserStats(req.params.id);
        (0, response_1.sendSuccess)(res, stats);
    }
    catch (error) {
        handleError(res, error, next);
    }
}
async function resetUserPassword(req, res, next) {
    try {
        await admin_service_1.adminService.resetUserPassword(req.params.id, req.body.newPassword);
        logger_1.logger.info(`User password reset: ${req.params.id}`, { adminId: req.user?.id });
        (0, response_1.sendSuccess)(res, null, 'Password reset');
    }
    catch (error) {
        handleError(res, error, next);
    }
}
// =====================================================
// REPORTS
// =====================================================
async function getInstitutesReport(req, res, next) {
    try {
        const { query } = admin_validation_1.reportFiltersSchema.parse({ query: req.query });
        const report = await admin_service_1.adminService.getInstitutesReport(query);
        if (query.format === 'csv') {
            sendCsv(res, report.institutes, 'institutes.csv');
            return;
        }
        (0, response_1.sendSuccess)(res, report);
    }
    catch (error) {
        next(error);
    }
}
async function getUsersReport(req, res, next) {
    try {
        const { query } = admin_validation_1.reportFiltersSchema.parse({ query: req.query });
        const report = await admin_service_1.adminService.getUsersReport(query);
        if (query.format === 'csv') {
            sendCsv(res, report.users, 'users.csv');
            return;
        }
        (0, response_1.sendSuccess)(res, report);
    }
    catch (error) {
        next(error);
    }
}
async function getActivityReport(req, res, next) {
    try {
        const { query } = admin_validation_1.reportFiltersSchema.parse({ query: req.query });
        const report = await admin_service_1.adminService.getActivityReport(query);
        if (query.format === 'csv') {
            sendCsv(res, report.activities, 'activity.csv');
            return;
        }
        (0, response_1.sendSuccess)(res, report);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=admin.controller.js.map