"use strict";
// src/module/practice/practice.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aptitude_routes_1 = __importDefault(require("./aptitude/aptitude.routes"));
const machine_routes_1 = __importDefault(require("./machine/machine.routes"));
// ✅ Fix: Change from 'interview.routes' to 'interview.router'
const languages_routes_1 = __importDefault(require("./common/languages.routes"));
const config_routes_1 = __importDefault(require("./common/config.routes"));
const enums_routes_1 = __importDefault(require("./common/enums.routes"));
const interview_1 = require("./interview");
const router = (0, express_1.Router)();
// Create interview routes with singleton dependencies
// Practice routes
router.use('/aptitude', aptitude_routes_1.default);
router.use('/machine', machine_routes_1.default);
router.use('/interview', interview_1.interviewRoutes);
// Common APIs
router.use('/languages', languages_routes_1.default);
router.use('/config', config_routes_1.default);
router.use('/enums', enums_routes_1.default);
exports.default = router;
//# sourceMappingURL=practice.routes.js.map