"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_controller_1 = require("./config.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/time-limits', config_controller_1.configController.getTimeLimits.bind(config_controller_1.configController));
exports.default = router;
//# sourceMappingURL=config.routes.js.map