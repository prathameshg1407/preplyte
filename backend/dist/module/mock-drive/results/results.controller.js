"use strict";
// src/module/mock-drive/results/results.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsController = void 0;
const response_1 = require("../../../utils/response");
class ResultsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getResultOverview = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId } = req.params;
            const result = await this.service.getResultOverview(userId, driveId);
            (0, response_1.sendSuccess)(res, result, 'Result overview retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getDetailedReport = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId } = req.params;
            const result = await this.service.getDetailedReport(userId, driveId);
            (0, response_1.sendSuccess)(res, result, 'Detailed report retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ResultsController = ResultsController;
//# sourceMappingURL=results.controller.js.map