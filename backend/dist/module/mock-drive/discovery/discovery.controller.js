"use strict";
// src/module/mock-drive/discovery/discovery.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryController = void 0;
const response_1 = require("../../../utils/response");
class DiscoveryController {
    service;
    constructor(service) {
        this.service = service;
    }
    listAvailableDrives = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { page, limit, status, instituteId, search, registrationOpen } = req.query;
            const result = await this.service.listAvailableDrives(userId, {
                page,
                limit,
                filters: { status, instituteId, search, registrationOpen },
            }, userRole);
            (0, response_1.sendSuccess)(res, result, 'Mock drives retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getDriveDetails = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { driveId } = req.params;
            const result = await this.service.getDriveDetails(userId, driveId, userRole);
            (0, response_1.sendSuccess)(res, result, 'Mock drive details retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    checkEligibility = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { driveId } = req.params;
            const result = await this.service.checkEligibility(userId, driveId, userRole);
            (0, response_1.sendSuccess)(res, result, 'Eligibility check completed');
        }
        catch (error) {
            next(error);
        }
    };
    register = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { driveId } = req.params;
            const result = await this.service.register(userId, driveId, userRole);
            (0, response_1.sendSuccess)(res, result, 'Registration successful', 201);
        }
        catch (error) {
            next(error);
        }
    };
    withdrawRegistration = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { driveId } = req.params;
            await this.service.withdrawRegistration(userId, driveId, userRole);
            (0, response_1.sendSuccess)(res, null, 'Registration withdrawn successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getMyRegistrations = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const result = await this.service.getMyRegistrations(userId);
            (0, response_1.sendSuccess)(res, result, 'Registrations retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.DiscoveryController = DiscoveryController;
//# sourceMappingURL=discovery.controller.js.map