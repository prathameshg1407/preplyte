"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSortParams = exports.parsePaginationParams = exports.createPaginationMeta = exports.sendAccepted = exports.sendNoContent = exports.sendCreated = exports.sendError = exports.sendPaginated = exports.sendSuccess = void 0;
// ============================================
// Response Helpers
// ============================================
const sendSuccess = (res, data, message, statusCode = 200) => {
    const response = {
        success: true,
        data,
    };
    if (message) {
        response.message = message;
    }
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendPaginated = (res, items, meta, message, statusCode = 200) => {
    const response = {
        success: true,
        data: items,
        meta,
    };
    if (message) {
        response.message = message;
    }
    return res.status(statusCode).json(response);
};
exports.sendPaginated = sendPaginated;
const sendError = (res, code, message, statusCode = 400, details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
        },
    };
    if (details !== undefined) {
        response.error.details = details;
    }
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendCreated = (res, data, message = 'Resource created successfully') => {
    return (0, exports.sendSuccess)(res, data, message, 201);
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    return res.status(204).send();
};
exports.sendNoContent = sendNoContent;
const sendAccepted = (res, data, message = 'Request accepted') => {
    return (0, exports.sendSuccess)(res, data, message, 202);
};
exports.sendAccepted = sendAccepted;
// ============================================
// Pagination Helpers
// ============================================
const createPaginationMeta = (page, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
};
exports.createPaginationMeta = createPaginationMeta;
const parsePaginationParams = (query, defaults = {}) => {
    const { page: defaultPage = 1, limit: defaultLimit = 10, maxLimit = 100, } = defaults;
    let page = parseInt(query.page, 10) || defaultPage;
    let limit = parseInt(query.limit, 10) || defaultLimit;
    // Ensure valid values
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), maxLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.parsePaginationParams = parsePaginationParams;
const parseSortParams = (query, allowedFields, defaultField = 'createdAt', defaultOrder = 'desc') => {
    const sortField = query.sortBy || defaultField;
    const sortOrder = (query.sortOrder || defaultOrder).toLowerCase();
    return {
        field: allowedFields.includes(sortField) ? sortField : defaultField,
        order: sortOrder === 'asc' ? 'asc' : 'desc',
    };
};
exports.parseSortParams = parseSortParams;
//# sourceMappingURL=response.js.map