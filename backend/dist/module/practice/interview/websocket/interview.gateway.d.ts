import type { Server } from 'http';
declare class InterviewWebSocketGateway {
    private wss;
    private connections;
    private heartbeatInterval;
    private responseProcessingTimeout;
    private jwtSecret;
    private getJwtSecret;
    /**
     * Initialize WebSocket server
     */
    initialize(server: Server): void;
    /**
     * Handle HTTP upgrade request
     */
    private handleUpgrade;
    private findConnectionBySessionId;
    private rejectUpgrade;
    private authenticateToken;
    /**
     * Handle new authenticated WebSocket connection
     */
    private onConnection;
    /**
     * Setup WebSocket event handlers
     */
    private setupSocketHandlers;
    private isBinaryData;
    private toBuffer;
    private initializeInterview;
    private generateAndSpeakOpening;
    private handleMessage;
    private handleAudioData;
    private handleTranscription;
    private scheduleResponseProcessing;
    private handleTranscriberError;
    private handleTranscriberClose;
    private reconnectTranscriber;
    private processUserResponse;
    private endInterview;
    private sendSessionState;
    private send;
    private sendError;
    private cleanupConnection;
    private startHeartbeat;
    private createMinimalResume;
    /**
     * Shutdown the WebSocket server
     */
    shutdown(): void;
}
export declare const interviewGateway: InterviewWebSocketGateway;
export { InterviewWebSocketGateway };
//# sourceMappingURL=interview.gateway.d.ts.map