"use strict";
// src/modules/instituteadmin/mock-drive/index.ts
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveRoutes = void 0;
// Main exports
__exportStar(require("./mockdrive.types"), exports);
__exportStar(require("./mockdrive.validation"), exports);
__exportStar(require("./mockdrive.service"), exports);
__exportStar(require("./mockdrive.controller"), exports);
var mockdrive_routes_1 = require("./mockdrive.routes");
Object.defineProperty(exports, "mockDriveRoutes", { enumerable: true, get: function () { return __importDefault(mockdrive_routes_1).default; } });
// Sub-module exports
//# sourceMappingURL=index.js.map