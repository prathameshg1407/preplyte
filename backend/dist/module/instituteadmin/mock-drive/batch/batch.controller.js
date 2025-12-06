"use strict";
// src/modules/instituteadmin/mock-drive/batch/batch.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchController = exports.BatchController = void 0;
const zod_1 = require("zod");
const batch_service_1 = require("./batch.service");
const response_1 = require("../../../../utils/response");
const logger_1 = require("../../../../utils/logger");
const batch_types_1 = require("./batch.types");
const batch_validation_1 = require("./batch.validation");
// ============================================
// Controller
// ============================================
class BatchController {
    async createBatch(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = batch_validation_1.mockDriveIdParamSchema.parse(req.params);
            const data = batch_validation_1.createBatchSchema.parse(req.body);
            const batch = await batch_service_1.batchService.createBatch(id, instituteId, data);
            (0, response_1.sendSuccess)(res, batch, 'Batch created successfully', 201);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getBatchById(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const batch = await batch_service_1.batchService.getBatchById(id, batchId, instituteId);
            (0, response_1.sendSuccess)(res, batch, 'Batch retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async listBatches(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = batch_validation_1.mockDriveIdParamSchema.parse(req.params);
            const query = batch_validation_1.listBatchesQuerySchema.parse(req.query);
            const result = await batch_service_1.batchService.listBatches(id, instituteId, query);
            (0, response_1.sendSuccess)(res, result, 'Batches retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async updateBatch(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const data = batch_validation_1.updateBatchSchema.parse(req.body);
            const batch = await batch_service_1.batchService.updateBatch(id, batchId, instituteId, data);
            (0, response_1.sendSuccess)(res, batch, 'Batch updated successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async deleteBatch(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            await batch_service_1.batchService.deleteBatch(id, batchId, instituteId);
            (0, response_1.sendSuccess)(res, null, 'Batch deleted successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async autoCreateBatches(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = batch_validation_1.mockDriveIdParamSchema.parse(req.params);
            const data = batch_validation_1.autoCreateBatchesSchema.parse(req.body);
            const batches = await batch_service_1.batchService.autoCreateBatches(id, instituteId, data);
            (0, response_1.sendSuccess)(res, batches, `${batches.length} batches created`, 201);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async assignStudents(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const data = batch_validation_1.assignStudentsSchema.parse(req.body);
            const result = await batch_service_1.batchService.assignStudents(id, batchId, instituteId, data);
            (0, response_1.sendSuccess)(res, result, `${result.assigned} students assigned`);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async unassignStudents(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const { registrationIds } = batch_validation_1.assignStudentsSchema.parse(req.body);
            const result = await batch_service_1.batchService.unassignStudents(id, batchId, instituteId, registrationIds);
            (0, response_1.sendSuccess)(res, result, `${result.unassigned} students unassigned`);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getBatchStudents(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const students = await batch_service_1.batchService.getBatchStudents(id, batchId, instituteId);
            (0, response_1.sendSuccess)(res, students, 'Students retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async startBatch(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const batch = await batch_service_1.batchService.startBatch(id, batchId, instituteId);
            (0, response_1.sendSuccess)(res, batch, 'Batch started successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async completeBatch(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, batchId } = batch_validation_1.batchIdParamSchema.parse(req.params);
            const batch = await batch_service_1.batchService.completeBatch(id, batchId, instituteId);
            (0, response_1.sendSuccess)(res, batch, 'Batch completed successfully');
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
            (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed', 400, errors);
            return;
        }
        if (error instanceof batch_types_1.BatchError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        // Handle inline MockDrive errors
        if (error instanceof Error && 'code' in error && 'statusCode' in error) {
            const e = error;
            (0, response_1.sendError)(res, e.code, e.message, e.statusCode);
            return;
        }
        logger_1.logger.error('Batch controller error', { error });
        next(error);
    }
}
exports.BatchController = BatchController;
exports.batchController = new BatchController();
//# sourceMappingURL=batch.controller.js.map