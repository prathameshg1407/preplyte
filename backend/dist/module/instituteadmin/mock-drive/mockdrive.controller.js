"use strict";
// src/modules/instituteadmin/mock-drive/mockdrive.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveController = exports.MockDriveController = void 0;
const mockdrive_service_1 = require("./mockdrive.service");
const mockdrive_validation_1 = require("./mockdrive.validation");
const response_1 = require("../../../utils/response");
const logger_1 = require("../../../utils/logger");
const mockdrive_types_1 = require("./mockdrive.types");
const zod_1 = require("zod");
// ============================================
// Helper function to transform validated data
// ============================================
function transformToDTO(data) {
    // Convert null to undefined for optional fields where needed
    // This is handled at the service layer, so we just pass through
    return data;
}
// ============================================
// Controller Class
// ============================================
class MockDriveController {
    // ==========================================
    // Create Mock Drive
    // ==========================================
    async create(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const validatedData = mockdrive_validation_1.createMockDriveSchema.parse(req.body);
            // Transform to DTO - the service accepts null values
            const dto = {
                title: validatedData.title,
                description: validatedData.description,
                instructions: validatedData.instructions,
                registrationStartDate: validatedData.registrationStartDate,
                registrationEndDate: validatedData.registrationEndDate,
                maxRegistrations: validatedData.maxRegistrations,
                driveStartDate: validatedData.driveStartDate,
                driveEndDate: validatedData.driveEndDate,
                allowLateSubmission: validatedData.allowLateSubmission,
                showLeaderboard: validatedData.showLeaderboard,
                showResultsImmediately: validatedData.showResultsImmediately,
                resultsReleaseDate: validatedData.resultsReleaseDate,
                shuffleQuestions: validatedData.shuffleQuestions,
                enableProctoring: validatedData.enableProctoring,
                proctoringSettings: validatedData.proctoringSettings,
            };
            const mockDrive = await mockdrive_service_1.mockDriveService.create(instituteId, dto);
            (0, response_1.sendSuccess)(res, mockDrive, 'Mock drive created successfully', 201);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Mock Drive by ID
    // ==========================================
    async getById(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            const mockDrive = await mockdrive_service_1.mockDriveService.getById(id, instituteId);
            (0, response_1.sendSuccess)(res, mockDrive, 'Mock drive retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // List Mock Drives
    // ==========================================
    async list(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const query = mockdrive_validation_1.listMockDrivesQuerySchema.parse(req.query);
            const result = await mockdrive_service_1.mockDriveService.list(instituteId, query);
            (0, response_1.sendSuccess)(res, result, 'Mock drives retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Update Mock Drive
    // ==========================================
    async update(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            const validatedData = mockdrive_validation_1.updateMockDriveSchema.parse(req.body);
            // Transform to DTO
            const dto = {
                ...(validatedData.title !== undefined && { title: validatedData.title }),
                ...(validatedData.description !== undefined && { description: validatedData.description }),
                ...(validatedData.instructions !== undefined && { instructions: validatedData.instructions }),
                ...(validatedData.registrationStartDate !== undefined && { registrationStartDate: validatedData.registrationStartDate }),
                ...(validatedData.registrationEndDate !== undefined && { registrationEndDate: validatedData.registrationEndDate }),
                ...(validatedData.maxRegistrations !== undefined && { maxRegistrations: validatedData.maxRegistrations }),
                ...(validatedData.driveStartDate !== undefined && { driveStartDate: validatedData.driveStartDate }),
                ...(validatedData.driveEndDate !== undefined && { driveEndDate: validatedData.driveEndDate }),
                ...(validatedData.allowLateSubmission !== undefined && { allowLateSubmission: validatedData.allowLateSubmission }),
                ...(validatedData.showLeaderboard !== undefined && { showLeaderboard: validatedData.showLeaderboard }),
                ...(validatedData.showResultsImmediately !== undefined && { showResultsImmediately: validatedData.showResultsImmediately }),
                ...(validatedData.resultsReleaseDate !== undefined && { resultsReleaseDate: validatedData.resultsReleaseDate }),
                ...(validatedData.shuffleQuestions !== undefined && { shuffleQuestions: validatedData.shuffleQuestions }),
                ...(validatedData.enableProctoring !== undefined && { enableProctoring: validatedData.enableProctoring }),
                ...(validatedData.proctoringSettings !== undefined && { proctoringSettings: validatedData.proctoringSettings }),
                ...(validatedData.status !== undefined && { status: validatedData.status }),
            };
            const mockDrive = await mockdrive_service_1.mockDriveService.update(id, instituteId, dto);
            (0, response_1.sendSuccess)(res, mockDrive, 'Mock drive updated successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Delete Mock Drive
    // ==========================================
    async delete(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            await mockdrive_service_1.mockDriveService.delete(id, instituteId);
            (0, response_1.sendSuccess)(res, null, 'Mock drive deleted successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Publish Mock Drive
    // ==========================================
    async publish(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            const mockDrive = await mockdrive_service_1.mockDriveService.publish(id, instituteId);
            (0, response_1.sendSuccess)(res, mockDrive, 'Mock drive published successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Cancel Mock Drive
    // ==========================================
    async cancel(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            const mockDrive = await mockdrive_service_1.mockDriveService.cancel(id, instituteId);
            (0, response_1.sendSuccess)(res, mockDrive, 'Mock drive cancelled successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Mock Drive Stats
    // ==========================================
    async getStats(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            const stats = await mockdrive_service_1.mockDriveService.getStats(id, instituteId);
            (0, response_1.sendSuccess)(res, stats, 'Mock drive stats retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Duplicate Mock Drive
    // ==========================================
    async duplicate(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockdrive_validation_1.mockDriveIdParamSchema.parse(req.params);
            const { title } = req.body;
            const mockDrive = await mockdrive_service_1.mockDriveService.duplicate(id, instituteId, title);
            (0, response_1.sendSuccess)(res, mockDrive, 'Mock drive duplicated successfully', 201);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Error Handler
    // ==========================================
    handleError(error, res, next) {
        if (error instanceof zod_1.z.ZodError) {
            const formattedErrors = error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed', 400, formattedErrors);
            return;
        }
        if (error instanceof mockdrive_types_1.MockDriveError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        logger_1.logger.error('MockDrive controller error', error);
        next(error);
    }
}
exports.MockDriveController = MockDriveController;
// Export singleton instance
exports.mockDriveController = new MockDriveController();
//# sourceMappingURL=mockdrive.controller.js.map