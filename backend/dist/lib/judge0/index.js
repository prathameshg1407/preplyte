"use strict";
// src/lib/judge0/index.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.judge0Service = exports.Judge0Service = exports.Judge0Client = void 0;
__exportStar(require("./judge0.types"), exports);
__exportStar(require("./judge0.languages"), exports);
var judge0_client_1 = require("./judge0.client");
Object.defineProperty(exports, "Judge0Client", { enumerable: true, get: function () { return judge0_client_1.Judge0Client; } });
var judge0_service_1 = require("./judge0.service");
Object.defineProperty(exports, "Judge0Service", { enumerable: true, get: function () { return judge0_service_1.Judge0Service; } });
Object.defineProperty(exports, "judge0Service", { enumerable: true, get: function () { return judge0_service_1.judge0Service; } });
// Default export for backward compatibility
var judge0_service_2 = require("./judge0.service");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return judge0_service_2.judge0Service; } });
//# sourceMappingURL=index.js.map