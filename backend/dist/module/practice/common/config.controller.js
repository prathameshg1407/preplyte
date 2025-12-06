"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configController = exports.ConfigController = void 0;
const config_service_1 = require("./config.service");
const response_1 = require("../../../utils/response");
class ConfigController {
    /**
     * GET /api/config/time-limits
     */
    getTimeLimits(_req, res, next) {
        try {
            const result = config_service_1.configService.getTimeLimits();
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ConfigController = ConfigController;
exports.configController = new ConfigController();
//# sourceMappingURL=config.controller.js.map