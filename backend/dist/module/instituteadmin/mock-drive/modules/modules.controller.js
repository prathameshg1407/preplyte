"use strict";
// src/modules/instituteadmin/mock-drive/modules/modules.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveModuleController = exports.MockDriveModuleController = void 0;
const zod_1 = require("zod");
const modules_service_1 = require("./modules.service");
const response_1 = require("../../../../utils/response");
const logger_1 = require("../../../../utils/logger");
const modules_types_1 = require("./modules.types");
const modules_validation_1 = require("./modules.validation");
// ============================================
// Controller
// ============================================
class MockDriveModuleController {
    async addModule(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = modules_validation_1.mockDriveIdParamSchema.parse(req.params);
            const data = modules_validation_1.createModuleSchema.parse(req.body);
            const module = await modules_service_1.mockDriveModuleService.addModule(id, instituteId, data);
            (0, response_1.sendSuccess)(res, module, 'Module added successfully', 201);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getModules(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = modules_validation_1.mockDriveIdParamSchema.parse(req.params);
            const query = modules_validation_1.listModulesQuerySchema.parse(req.query);
            const modules = await modules_service_1.mockDriveModuleService.getModules(id, instituteId, query);
            (0, response_1.sendSuccess)(res, modules, 'Modules retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getModulesSummary(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = modules_validation_1.mockDriveIdParamSchema.parse(req.params);
            const summary = await modules_service_1.mockDriveModuleService.getModulesSummary(id, instituteId);
            (0, response_1.sendSuccess)(res, summary, 'Summary retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getModule(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, moduleId } = modules_validation_1.moduleIdParamSchema.parse(req.params);
            const module = await modules_service_1.mockDriveModuleService.getModule(id, moduleId, instituteId);
            (0, response_1.sendSuccess)(res, module, 'Module retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async updateModule(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, moduleId } = modules_validation_1.moduleIdParamSchema.parse(req.params);
            const data = modules_validation_1.updateModuleSchema.parse(req.body);
            const module = await modules_service_1.mockDriveModuleService.updateModule(id, moduleId, instituteId, data);
            (0, response_1.sendSuccess)(res, module, 'Module updated successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async deleteModule(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, moduleId } = modules_validation_1.moduleIdParamSchema.parse(req.params);
            await modules_service_1.mockDriveModuleService.deleteModule(id, moduleId, instituteId);
            (0, response_1.sendSuccess)(res, null, 'Module deleted successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async reorderModules(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = modules_validation_1.mockDriveIdParamSchema.parse(req.params);
            const data = modules_validation_1.reorderModulesSchema.parse(req.body);
            const modules = await modules_service_1.mockDriveModuleService.reorderModules(id, instituteId, data);
            (0, response_1.sendSuccess)(res, modules, 'Modules reordered successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async duplicateModule(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, moduleId } = modules_validation_1.moduleIdParamSchema.parse(req.params);
            const module = await modules_service_1.mockDriveModuleService.duplicateModule(id, moduleId, instituteId);
            (0, response_1.sendSuccess)(res, module, 'Module duplicated successfully', 201);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getSupportedLanguages(req, res, next) {
        try {
            const languages = modules_service_1.mockDriveModuleService.getSupportedLanguages();
            (0, response_1.sendSuccess)(res, languages, 'Supported languages retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Helpers
    // ==========================================
    getInstituteId(req, res) {
        const instituteId = req.user?.instituteId;
        if (!instituteId) {
            (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
            return null;
        }
        return instituteId;
    }
    handleError(error, res, next) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            logger_1.logger.warn('Validation failed', {
                errors,
                path: res.req?.path,
            });
            (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed', 400, errors);
            return;
        }
        if (error instanceof modules_types_1.ModuleError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        // Handle inline MockDrive errors
        if (error instanceof Error && 'code' in error && 'statusCode' in error) {
            const e = error;
            (0, response_1.sendError)(res, e.code, e.message, e.statusCode);
            return;
        }
        logger_1.logger.error('Module controller error', { error });
        next(error);
    }
}
exports.MockDriveModuleController = MockDriveModuleController;
exports.mockDriveModuleController = new MockDriveModuleController();
//# sourceMappingURL=modules.controller.js.map