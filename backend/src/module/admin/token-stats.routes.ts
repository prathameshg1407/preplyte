// src/module/admin/token-stats.routes.ts
//
// Admin endpoint to view LLM token usage statistics.
// Mounted in admin.routes.ts → requires PLATFORM_ADMIN role.
// 
// Routes:
//   GET  /api/admin/token-stats            - Full summary (all time)
//   GET  /api/admin/token-stats/recent     - Last N raw entries
//   GET  /api/admin/token-stats/session/:sessionId - Per-session summary
//   DELETE /api/admin/token-stats          - Clear log file (for fresh test runs)

import { Router, Request, Response } from 'express';
import { tokenTracker } from '../../utils/token-tracker';
import { logger } from '../../utils/logger';

const router = Router();

// =====================================================
// GET /api/admin/token-stats
// Full aggregate summary
// =====================================================
router.get('/', (_req: Request, res: Response) => {
    try {
        const summary = tokenTracker.getSummary();
        res.json({
            success: true,
            data: {
                trackingEnabled: tokenTracker.isEnabled,
                logFile: tokenTracker.logFile,
                summary,
            },
        });
    } catch (err) {
        logger.error('[TokenStats] Failed to get summary', err);
        res.status(500).json({ success: false, error: 'Failed to read token stats' });
    }
});

// =====================================================
// GET /api/admin/token-stats/recent?limit=50
// Raw recent entries (newest first)
// =====================================================
router.get('/recent', (req: Request, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 500);
        const entries = tokenTracker.getRecentEntries(limit);
        res.json({
            success: true,
            data: {
                count: entries.length,
                entries,
            },
        });
    } catch (err) {
        logger.error('[TokenStats] Failed to get recent entries', err);
        res.status(500).json({ success: false, error: 'Failed to read token log' });
    }
});

// =====================================================
// GET /api/admin/token-stats/session/:sessionId
// Per-session summary (e.g., for one student)
// =====================================================
router.get('/session/:sessionId', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const summary = tokenTracker.getSummary({ sessionId });
        res.json({
            success: true,
            data: {
                sessionId,
                summary,
            },
        });
    } catch (err) {
        logger.error('[TokenStats] Failed to get session summary', err);
        res.status(500).json({ success: false, error: 'Failed to read token stats for session' });
    }
});

// =====================================================
// DELETE /api/admin/token-stats
// Clear the log file (use before a test run for clean data)
// =====================================================
router.delete('/', (_req: Request, res: Response) => {
    try {
        tokenTracker.clearLog();
        res.json({
            success: true,
            message: 'Token usage log cleared successfully',
        });
    } catch (err) {
        logger.error('[TokenStats] Failed to clear log', err);
        res.status(500).json({ success: false, error: 'Failed to clear token log' });
    }
});

export default router;
