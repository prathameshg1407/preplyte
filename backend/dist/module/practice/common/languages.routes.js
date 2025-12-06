"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const languages_controller_1 = require("./languages.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', languages_controller_1.languagesController.getAllLanguages.bind(languages_controller_1.languagesController));
router.get('/:id', languages_controller_1.languagesController.getLanguageById.bind(languages_controller_1.languagesController));
exports.default = router;
//# sourceMappingURL=languages.routes.js.map