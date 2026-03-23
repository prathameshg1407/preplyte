// src/utils/token-tracker.ts
//
// Token usage tracker for Groq LLM API calls.
// Enable by setting ENABLE_TOKEN_TRACKING=true in your .env
// Logs are written to logs/token-usage.json (one JSON object per line = NDJSON)
// View stats via GET /api/admin/token-stats

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// =====================================================
// TYPES
// =====================================================

export type TokenCallType =
  | 'generateOpening'
  | 'generateNextQuestion'
  | 'scoreResponse'
  | 'generateClosingQuestion'
  | 'generateTopicTransition'
  | 'resultsReport'
  | 'resumeParsing'
  | 'other';

export interface TokenUsageEntry {
  timestamp: string;          // ISO 8601
  callType: TokenCallType;    // What kind of LLM call this was
  model: string;              // e.g. llama-3.3-70b-versatile
  promptTokens: number;       // Input tokens consumed
  completionTokens: number;   // Output tokens consumed
  totalTokens: number;        // promptTokens + completionTokens
  durationMs: number;         // How long the API call took
  sessionId?: string;         // attemptId / sessionId for linking to a student
  userId?: string;            // Who triggered this call
  keyIndex?: number;          // Which API key was used (for key rotation analysis)
  success: boolean;           // Did the call succeed?
  errorReason?: string;       // If failed, why
}

export interface TokenUsageSummary {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  averageTokensPerCall: number;
  averageDurationMs: number;
  byCallType: Record<string, {
    calls: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    avgDurationMs: number;
  }>;
  byModel: Record<string, {
    calls: number;
    totalTokens: number;
  }>;
  bySession: Record<string, {
    calls: number;
    totalTokens: number;
    callTypes: string[];
  }>;
  firstEntryAt: string | null;
  lastEntryAt: string | null;
}

// =====================================================
// TOKEN TRACKER SINGLETON
// =====================================================

class TokenTrackerService {
  private readonly enabled: boolean;
  private readonly logFilePath: string;
  private writeStream: fs.WriteStream | null = null;

  constructor() {
    this.enabled = process.env.ENABLE_TOKEN_TRACKING === 'true';

    // Resolve log directory relative to project root
    const projectRoot = process.cwd();
    const logsDir = path.join(projectRoot, 'logs');
    this.logFilePath = path.join(logsDir, 'token-usage.json');

    if (this.enabled) {
      this.initLogFile(logsDir);
      logger.info('[TokenTracker] Token tracking ENABLED', { logFile: this.logFilePath });
    } else {
      logger.debug('[TokenTracker] Token tracking disabled. Set ENABLE_TOKEN_TRACKING=true to enable.');
    }
  }

  // ===================================================
  // PUBLIC: RECORD A USAGE EVENT
  // ===================================================

  record(entry: TokenUsageEntry): void {
    if (!this.enabled) return;

    try {
      const line = JSON.stringify(entry) + '\n';
      if (this.writeStream) {
        this.writeStream.write(line);
      }

      logger.debug('[TokenTracker] Usage recorded', {
        callType: entry.callType,
        model: entry.model,
        totalTokens: entry.totalTokens,
        durationMs: entry.durationMs,
        sessionId: entry.sessionId,
      });
    } catch (err) {
      logger.error('[TokenTracker] Failed to write usage entry', err);
    }
  }

  // ===================================================
  // PUBLIC: READ AND SUMMARIZE LOG FILE
  // ===================================================

  getSummary(options?: { sessionId?: string; since?: Date; limit?: number }): TokenUsageSummary {
    const summary: TokenUsageSummary = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      averageTokensPerCall: 0,
      averageDurationMs: 0,
      byCallType: {},
      byModel: {},
      bySession: {},
      firstEntryAt: null,
      lastEntryAt: null,
    };

    if (!this.enabled && !fs.existsSync(this.logFilePath)) {
      return summary;
    }

    try {
      if (!fs.existsSync(this.logFilePath)) return summary;

      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);

      const limit = options?.limit ?? lines.length;
      const recentLines = lines.slice(-limit);

      let totalDuration = 0;

      for (const line of recentLines) {
        let entry: TokenUsageEntry;
        try {
          entry = JSON.parse(line);
        } catch {
          continue;
        }

        // Filter by sessionId if provided
        if (options?.sessionId && entry.sessionId !== options.sessionId) continue;

        // Filter by since date if provided
        if (options?.since && new Date(entry.timestamp) < options.since) continue;

        summary.totalCalls++;
        if (entry.success) summary.successfulCalls++;
        else summary.failedCalls++;

        summary.totalPromptTokens += entry.promptTokens;
        summary.totalCompletionTokens += entry.completionTokens;
        summary.totalTokens += entry.totalTokens;
        totalDuration += entry.durationMs;

        // Track first/last
        if (!summary.firstEntryAt || entry.timestamp < summary.firstEntryAt) {
          summary.firstEntryAt = entry.timestamp;
        }
        if (!summary.lastEntryAt || entry.timestamp > summary.lastEntryAt) {
          summary.lastEntryAt = entry.timestamp;
        }

        // By call type
        if (!summary.byCallType[entry.callType]) {
          summary.byCallType[entry.callType] = { calls: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, avgDurationMs: 0 };
        }
        summary.byCallType[entry.callType].calls++;
        summary.byCallType[entry.callType].promptTokens += entry.promptTokens;
        summary.byCallType[entry.callType].completionTokens += entry.completionTokens;
        summary.byCallType[entry.callType].totalTokens += entry.totalTokens;
        summary.byCallType[entry.callType].avgDurationMs =
          (summary.byCallType[entry.callType].avgDurationMs * (summary.byCallType[entry.callType].calls - 1) + entry.durationMs) /
          summary.byCallType[entry.callType].calls;

        // By model
        if (!summary.byModel[entry.model]) {
          summary.byModel[entry.model] = { calls: 0, totalTokens: 0 };
        }
        summary.byModel[entry.model].calls++;
        summary.byModel[entry.model].totalTokens += entry.totalTokens;

        // By session
        if (entry.sessionId) {
          if (!summary.bySession[entry.sessionId]) {
            summary.bySession[entry.sessionId] = { calls: 0, totalTokens: 0, callTypes: [] };
          }
          summary.bySession[entry.sessionId].calls++;
          summary.bySession[entry.sessionId].totalTokens += entry.totalTokens;
          if (!summary.bySession[entry.sessionId].callTypes.includes(entry.callType)) {
            summary.bySession[entry.sessionId].callTypes.push(entry.callType);
          }
        }
      }

      if (summary.totalCalls > 0) {
        summary.averageTokensPerCall = Math.round(summary.totalTokens / summary.totalCalls);
        summary.averageDurationMs = Math.round(totalDuration / summary.totalCalls);
      }
    } catch (err) {
      logger.error('[TokenTracker] Failed to read log file for summary', err);
    }

    return summary;
  }

  // ===================================================
  // PUBLIC: GET RAW RECENT ENTRIES
  // ===================================================

  getRecentEntries(limit = 50): TokenUsageEntry[] {
    if (!fs.existsSync(this.logFilePath)) return [];

    try {
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const recentLines = lines.slice(-limit);
      return recentLines
        .map(l => { try { return JSON.parse(l) as TokenUsageEntry; } catch { return null; } })
        .filter((e): e is TokenUsageEntry => e !== null)
        .reverse(); // newest first
    } catch {
      return [];
    }
  }

  // ===================================================
  // PUBLIC: CLEAR LOG FILE
  // ===================================================

  clearLog(): void {
    try {
      if (this.writeStream) {
        this.writeStream.close();
        this.writeStream = null;
      }
      if (fs.existsSync(this.logFilePath)) {
        fs.writeFileSync(this.logFilePath, '');
      }
      this.initLogFile(path.dirname(this.logFilePath));
      logger.info('[TokenTracker] Log file cleared');
    } catch (err) {
      logger.error('[TokenTracker] Failed to clear log file', err);
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  get logFile(): string {
    return this.logFilePath;
  }

  // ===================================================
  // PRIVATE
  // ===================================================

  private initLogFile(logsDir: string): void {
    try {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      // Open file in append mode so we don't lose data across restarts
      this.writeStream = fs.createWriteStream(this.logFilePath, { flags: 'a', encoding: 'utf8' });
      this.writeStream.on('error', (err) => {
        logger.error('[TokenTracker] Write stream error', err);
      });
    } catch (err) {
      logger.error('[TokenTracker] Failed to initialize log file', err);
    }
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const tokenTracker = new TokenTrackerService();
