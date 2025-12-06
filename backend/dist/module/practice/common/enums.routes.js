"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enums_controller_1 = require("./enums.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/difficulty-levels', enums_controller_1.enumsController.getDifficultyLevels.bind(enums_controller_1.enumsController));
router.get('/question-types', enums_controller_1.enumsController.getQuestionTypes.bind(enums_controller_1.enumsController));
exports.default = router;
//# sourceMappingURL=enums.routes.js.map