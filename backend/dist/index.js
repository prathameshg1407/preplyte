"use strict";
// src/index.ts
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
const app_1 = __importStar(require("./app"));
const http_1 = require("http");
const logger_1 = require("./utils/logger");
const db_1 = require("./lib/db");
const interview_1 = require("./module/practice/interview");
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
async function startServer() {
    logger_1.logger.info('Starting server...', {
        environment: app_1.config.env,
        port: PORT,
        host: HOST,
    });
    try {
        // Check database connection
        logger_1.logger.info('Checking database connection...');
        await db_1.prisma.$queryRaw `SELECT 1`;
        logger_1.logger.info('✅ Database connected successfully');
        // Create HTTP server from Express app
        const httpServer = (0, http_1.createServer)(app_1.default);
        // Initialize WebSocket gateway BEFORE starting the server
        // This registers the 'upgrade' event handler
        interview_1.interviewGateway.initialize(httpServer);
        // Start the HTTP server
        httpServer.listen(PORT, HOST, () => {
            logger_1.logger.info('🚀 Server running', {
                environment: app_1.config.env,
                port: PORT,
                host: HOST,
                health: `http://localhost:${PORT}/health`,
                api: `http://localhost:${PORT}/api`,
                websocket: `ws://localhost:${PORT}/ws/interview/:sessionId`,
            });
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} received. Starting graceful shutdown...`);
            // Shutdown WebSocket gateway first
            interview_1.interviewGateway.shutdown();
            httpServer.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await db_1.prisma.$disconnect();
                    logger_1.logger.info('Database connections closed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error('Error during shutdown', error);
                    process.exit(1);
                }
            });
            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', error);
        await db_1.prisma.$disconnect();
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map