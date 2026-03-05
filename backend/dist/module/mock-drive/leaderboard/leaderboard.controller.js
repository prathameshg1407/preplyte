"use strict";
// src/module/mock-drive/leaderboard/leaderboard.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardController = void 0;
const response_1 = require("../../../utils/response");
class LeaderboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    getLeaderboard = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId } = req.params;
            const { page, limit, batchId, departmentId } = req.query;
            const result = await this.service.getLeaderboard(userId, driveId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10, { batchId, departmentId });
            (0, response_1.sendSuccess)(res, result, 'Leaderboard retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getMyRank = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId } = req.params;
            const { batchId } = req.query;
            const result = await this.service.getMyRank(userId, driveId, batchId);
            (0, response_1.sendSuccess)(res, result, 'Rank retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.LeaderboardController = LeaderboardController;
//# sourceMappingURL=leaderboard.controller.js.map