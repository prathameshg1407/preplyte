"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const ctrl = __importStar(require("./admin.controller"));
const admin_validation_1 = require("./admin.validation");
const router = (0, express_1.Router)();
// All routes require PLATFORM_ADMIN
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('PLATFORM_ADMIN'));
// =====================================================
// ANALYTICS
// =====================================================
router.get('/analytics', (0, validate_middleware_1.validate)(admin_validation_1.dateRangeSchema), ctrl.getPlatformAnalytics);
// =====================================================
// INSTITUTES
// =====================================================
router.get('/institutes', ctrl.listInstitutes);
router.post('/institutes', (0, validate_middleware_1.validate)(admin_validation_1.createInstituteSchema), ctrl.createInstitute);
router.get('/institutes/:id', (0, validate_middleware_1.validate)(admin_validation_1.instituteIdSchema), ctrl.getInstitute);
router.patch('/institutes/:id', (0, validate_middleware_1.validate)(admin_validation_1.updateInstituteSchema), ctrl.updateInstitute);
router.delete('/institutes/:id', (0, validate_middleware_1.validate)(admin_validation_1.instituteIdSchema), ctrl.deleteInstitute);
router.patch('/institutes/:id/toggle-status', (0, validate_middleware_1.validate)(admin_validation_1.instituteIdSchema), ctrl.toggleInstituteStatus);
router.get('/institutes/:id/students', (0, validate_middleware_1.validate)(admin_validation_1.instituteStudentsSchema), ctrl.getInstituteStudents);
router.get('/institutes/:id/admins', (0, validate_middleware_1.validate)(admin_validation_1.instituteIdSchema), ctrl.getInstituteAdmins);
router.get('/institutes/:id/stats', (0, validate_middleware_1.validate)(admin_validation_1.instituteIdSchema), ctrl.getInstituteStats);
// =====================================================
// USERS
// =====================================================
router.get('/users', ctrl.listUsers);
router.post('/users', (0, validate_middleware_1.validate)(admin_validation_1.createUserSchema), ctrl.createUser);
router.get('/users/:id', (0, validate_middleware_1.validate)(admin_validation_1.userIdSchema), ctrl.getUser);
router.patch('/users/:id', (0, validate_middleware_1.validate)(admin_validation_1.updateUserSchema), ctrl.updateUser);
router.delete('/users/:id', (0, validate_middleware_1.validate)(admin_validation_1.userIdSchema), ctrl.deleteUser);
router.patch('/users/:id/toggle-status', (0, validate_middleware_1.validate)(admin_validation_1.userIdSchema), ctrl.toggleUserStatus);
router.get('/users/:id/stats', (0, validate_middleware_1.validate)(admin_validation_1.userIdSchema), ctrl.getUserStats);
router.post('/users/:id/reset-password', (0, validate_middleware_1.validate)(admin_validation_1.resetPasswordSchema), ctrl.resetUserPassword);
// =====================================================
// REPORTS
// =====================================================
router.get('/reports/institutes', (0, validate_middleware_1.validate)(admin_validation_1.reportFiltersSchema), ctrl.getInstitutesReport);
router.get('/reports/users', (0, validate_middleware_1.validate)(admin_validation_1.reportFiltersSchema), ctrl.getUsersReport);
router.get('/reports/activity', (0, validate_middleware_1.validate)(admin_validation_1.reportFiltersSchema), ctrl.getActivityReport);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map