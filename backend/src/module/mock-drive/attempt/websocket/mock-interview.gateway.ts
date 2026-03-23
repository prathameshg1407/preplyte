import { WebSocket, WebSocketServer } from 'ws';
import type { RawData } from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import { jwtVerify } from 'jose';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import {
    conversationEngineService,
    speechToTextService,
    textToSpeechService,
    resumeParserService,
    RealtimeTranscriber,
} from '../../../practice/interview/services';
import {
    ConversationContext,
    ParsedResume,
} from '../../../practice/interview/interview.types';
import { WS_EVENTS } from '../../../practice/interview/interview.constants';
import { MockDriveModuleType } from '@prisma/client';

// For typing the JSON stored in `attempt.data`
import type {
    WorkingInterviewData
} from '../executors/interview.executor';
import type {
    ConversationMessage
} from '../../shared';

interface AuthenticatedSocket extends WebSocket {
    id: string;
    userId: string;
    attemptId: string;
    isAlive: boolean;
    lastPongTime: number;
}

interface ActiveConnection {
    socket: AuthenticatedSocket;
    transcriber: RealtimeTranscriber | null;
    context: ConversationContext | null;
    workingData: WorkingInterviewData | null;
    isListening: boolean;
    isAISpeaking: boolean;
    currentTranscript: string;
    lastActivity: Date;
    isInitialized: boolean;
    isInitializing: boolean;
    pendingAudioChunks: Buffer[];
    isProcessingResponse: boolean; // Re-entrancy guard: prevents double-submission
    stopRecordingWaitTimer: NodeJS.Timeout | null; // Wait timer for final Deepgram transcript
}

interface JWTPayload {
    sub?: string;
    id?: string;
    [key: string]: unknown;
}

// ----------------------------------------------------------------------
// MOCK DRIVE WEBSOCKET GATEWAY
// ----------------------------------------------------------------------
class MockInterviewWebSocketGateway {
    private wss: WebSocketServer | null = null;
    private connections: Map<string, ActiveConnection> = new Map();
    private responseProcessingTimeout: Map<string, NodeJS.Timeout> = new Map();
    private jwtSecret: Uint8Array | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    private getJwtSecret(): Uint8Array {
        if (!this.jwtSecret) {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET environment variable is not set');
            }
            this.jwtSecret = new TextEncoder().encode(secret);
        }
        return this.jwtSecret;
    }

    initialize(server: Server): void {
        this.wss = new WebSocketServer({ noServer: true });

        server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
            this.handleUpgrade(request, socket, head);
        });

        this.wss.on('connection', (ws: WebSocket, request: IncomingMessage, attempt: any) => {
            this.onConnection(ws as AuthenticatedSocket, attempt);
        });

        this.startHeartbeat();

        logger.info('[Mock WS Gateway] WebSocket server initialized', {
            path: '/ws/mock-drive/interview/:attemptId',
        });
    }

    shutdown(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        for (const [id, connection] of this.connections.entries()) {
            this.cleanupConnection(id);
        }

        if (this.wss) {
            this.wss.close((err) => {
                if (err) logger.error('[Mock WS Gateway] Error closing WebSocket server', err);
                else logger.info('[Mock WS Gateway] WebSocket server closed');
            });
            this.wss = null;
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            for (const [id, connection] of this.connections.entries()) {
                const { socket } = connection;

                // Connection stale check (no message of any kind for 2 minutes)
                if (now - socket.lastPongTime > 120000) {
                    logger.warn('[Mock WS Gateway] Connection dead (timeout)', { id });
                    this.cleanupConnection(id);
                    continue;
                }

                // If no PING/PONG or message was received in the last 60s
                if (!socket.isAlive) {
                    logger.warn('[Mock WS Gateway] Connection dead (heartbeat failed)', { id });
                    this.cleanupConnection(id);
                    continue;
                }

                socket.isAlive = false;
                this.send(socket, { type: WS_EVENTS.SERVER.PING });
            }
        }, 60000);
    }

    private async handleUpgrade(
        request: IncomingMessage,
        socket: Duplex,
        head: Buffer
    ): Promise<void> {
        const url = new URL(request.url || '', `http://${request.headers.host}`);
        const pathname = url.pathname;

        const match = pathname.match(/^\/ws\/mock-drive\/interview\/([a-zA-Z0-9_-]+)$/);

        // If it doesn't match our path, ignore it (it might be for the Practice WS gateway)
        if (!match) {
            return;
        }

        const attemptId = match[1];

        try {
            const token = url.searchParams.get('token');
            if (!token) {
                this.rejectUpgrade(socket, 401, 'Authentication required');
                return;
            }

            const userId = await this.authenticateToken(token);
            if (!userId) {
                this.rejectUpgrade(socket, 401, 'Invalid or expired token');
                return;
            }

            // Find the attempt
            const attempt = await prisma.mockDriveModuleAttempt.findFirst({
                where: { id: attemptId, attempt: { userId } },
                include: { attempt: true, module: true },
            });

            if (!attempt) {
                this.rejectUpgrade(socket, 404, 'Attempt not found');
                return;
            }

            if (attempt.module?.moduleType !== MockDriveModuleType.AI_INTERVIEW) {
                this.rejectUpgrade(socket, 400, 'Not an interview module');
                return;
            }

            if (!['IN_PROGRESS'].includes(attempt.status)) {
                this.rejectUpgrade(socket, 400, 'Attempt is not in progress');
                return;
            }

            // Close existing connection for this attempt
            const existingConnection = this.findConnectionByAttemptId(attemptId);
            if (existingConnection) {
                this.cleanupConnection(existingConnection.socket.id);
            }

            this.wss!.handleUpgrade(request, socket, head, (ws) => {
                const authSocket = ws as AuthenticatedSocket;
                authSocket.id = nanoid();
                authSocket.userId = userId;
                authSocket.attemptId = attemptId;
                authSocket.isAlive = true;
                authSocket.lastPongTime = Date.now();

                this.wss!.emit('connection', authSocket, request, attempt);
            });

        } catch (error) {
            logger.error('[Mock WS Gateway] Upgrade error', { attemptId, error });
            this.rejectUpgrade(socket, 500, 'Internal server error');
        }
    }

    private findConnectionByAttemptId(attemptId: string): ActiveConnection | undefined {
        for (const connection of this.connections.values()) {
            if (connection.socket.attemptId === attemptId) {
                return connection;
            }
        }
        return undefined;
    }

    private rejectUpgrade(socket: Duplex, statusCode: number, message: string): void {
        const statusMessages: Record<number, string> = {
            400: 'Bad Request',
            401: 'Unauthorized',
            404: 'Not Found',
            500: 'Internal Server Error',
        };
        const response = [
            `HTTP/1.1 ${statusCode} ${statusMessages[statusCode] || 'Error'}`,
            'Content-Type: text/plain',
            'Connection: close',
            '',
            message,
        ].join('\r\n');
        socket.write(response);
        socket.destroy();
    }

    private async authenticateToken(token: string): Promise<string | null> {
        try {
            const secret = this.getJwtSecret();
            const { payload } = await jwtVerify(token, secret);
            const jwtPayload = payload as unknown as JWTPayload;
            const userId = jwtPayload.sub || jwtPayload.id;
            if (typeof userId !== 'string') return null;
            return userId;
        } catch (error) {
            return null;
        }
    }

    private async onConnection(socket: AuthenticatedSocket, attempt: any): Promise<void> {
        const connectionId = socket.id;

        const connection: ActiveConnection = {
            socket,
            transcriber: null,
            context: null,
            workingData: null,
            isListening: false,
            isAISpeaking: false,
            currentTranscript: '',
            lastActivity: new Date(),
            isInitialized: false,
            isInitializing: false,
            pendingAudioChunks: [],
            isProcessingResponse: false,
            stopRecordingWaitTimer: null,
        };

        this.connections.set(connectionId, connection);
        this.setupSocketHandlers(socket, connection);

        this.send(socket, {
            type: WS_EVENTS.SERVER.CONNECTED,
            data: {
                connectionId,
                sessionId: socket.attemptId, // Frontend uses sessionId key
                status: attempt.status,
            },
        });

        try {
            await this.initializeInterview(connection, attempt);
        } catch (error) {
            logger.error('[Mock WS Gateway] Interview initialization failed', error);
            this.sendError(socket, 'INIT_ERROR', 'Failed to initialize interview');
        }
    }

    private setupSocketHandlers(socket: AuthenticatedSocket, connection: ActiveConnection): void {
        socket.on('message', async (data: RawData) => {
            connection.lastActivity = new Date();
            // ANY message from the client counts as proof of life (isAlive = true)
            socket.isAlive = true;
            socket.lastPongTime = Date.now();
            
            try {
                if (this.isBinaryData(data)) {
                    const buffer = this.toBuffer(data);
                    await this.handleAudioData(connection, buffer);
                } else {
                    const messageString = data.toString();
                    logger.debug('[Mock WS Gateway] JSON message received', { id: connection.socket.id, msg: messageString });
                    const message = JSON.parse(messageString);
                    await this.handleMessage(connection, message);
                }
            } catch (error) {
                logger.error('[Mock WS Gateway] Message handling error', error);
                this.sendError(socket, 'MESSAGE_ERROR', 'Failed to process message');
            }
        });

        socket.on('pong', () => {
            socket.isAlive = true;
            socket.lastPongTime = Date.now();
        });

        socket.on('close', () => {
            this.cleanupConnection(socket.id);
        });

        socket.on('error', () => {
            this.cleanupConnection(socket.id);
        });
    }

    private isBinaryData(data: RawData): boolean {
        return Buffer.isBuffer(data) || data instanceof ArrayBuffer || ArrayBuffer.isView(data);
    }

    private toBuffer(data: RawData): Buffer {
        if (Buffer.isBuffer(data)) return data;
        if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data));
        if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        if (Array.isArray(data)) return Buffer.concat(data);
        throw new Error('Unsupported data type');
    }

    private async initializeInterview(connection: ActiveConnection, attempt: any): Promise<void> {
        if (connection.isInitialized || connection.isInitializing) return;
        connection.isInitializing = true;

        try {
            const workingData = attempt.moduleData as unknown as WorkingInterviewData;
            connection.workingData = workingData;

            // Extract details
            const config = workingData.config;
            let parsedResume: ParsedResume | null = null;
            if (config.resumeId) {
                try {
                    parsedResume = await resumeParserService.parseResumeById(connection.socket.userId, config.resumeId);
                } catch (e) { /* ignore */ }
            }

            if (!parsedResume) {
                parsedResume = {
                    rawText: '',
                    structured: { name: 'Candidate', email: '', phone: '', skills: [], experience: [], education: [], projects: [] },
                    hash: config.resumeId || nanoid(),
                    parsedAt: new Date(),
                };
            }

            // Map past responses
            const previousResponses = workingData.responses.map(res => ({
                id: res.id,
                questionIndex: res.questionIndex,
                category: res.category,
                question: res.question,
                answer: res.answer || '',
                isFollowup: res.isFollowup || false,
                scores: res.scores ? {
                    relevance: res.scores.relevance || 0,
                    clarity: res.scores.clarity || 0,
                    depth: res.scores.depth || 0,
                    technicalAccuracy: res.scores.technicalAccuracy || null,
                    overall: res.scores.overall || 0,
                } : { relevance: 0, clarity: 0, depth: 0, technicalAccuracy: null, overall: 0 },
                feedback: res.feedback || '',
                timeTakenSeconds: res.timeTakenSeconds || 0,
                answeredAt: res.answeredAt || new Date().toISOString()
            }));

            connection.context = await conversationEngineService.initializeContext(
                parsedResume,
                {
                    jobTitle: config.jobTitle || 'Software Engineer',
                    companyName: config.companyName || 'Company',
                    difficulty: config.difficulty || 'MEDIUM',
                    focusAreas: config.focusAreas || [],
                    targetQuestions: config.targetQuestions || 5,
                },
                previousResponses as any
            );

            // We must inject the history into context if there is existing loaded conversation
            if (workingData.conversation) {
                connection.context.history = workingData.conversation.map(msg => ({
                    id: msg.id,
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content,
                    timestamp: new Date(msg.timestamp)
                }));
            }

            try {
                connection.transcriber = speechToTextService.createRealtimeTranscriber({
                    onTranscript: (result) => this.handleTranscription(connection, result),
                    onError: (error) => this.handleTranscriberError(connection, error),
                    onClose: () => this.handleTranscriberClose(connection),
                });
                await connection.transcriber.start();
            } catch (error) {
                connection.transcriber = null;
            }

            connection.isInitialized = true;
            connection.isInitializing = false;
            connection.isListening = true;

            // Send Ready
            logger.info('[Mock WS Gateway] Interview initialized', { id: connection.socket.id, isResume: workingData.responses.length > 0 });
            this.send(connection.socket, {
                type: WS_EVENTS.SERVER.SESSION_READY,
                data: {
                    sessionId: attempt.id,
                    status: 'ready',
                    currentQuestion: conversationEngineService.getCurrentQuestionState(connection.context)
                }
            });

            if (workingData.responses.length === 0) {
                // Decision: if no answers recorded yet, we always speak the opening.
                // We check if an opening was already generated (e.g. by the executor or a previous connection).
                const lastAsst = connection.workingData!.conversation
                    .filter(m => m.role === 'assistant')
                    .slice(-1)[0];

                if (lastAsst) {
                    logger.info('[Mock WS Gateway] Reusing existing opening question', { id: connection.socket.id });
                    
                    // Add opening question to context so questionsAsked count is correct
                    if (connection.context!.questionsAsked.length === 0) {
                        connection.context!.questionsAsked.push({
                            id: lastAsst.id,
                            category: 'INTRODUCTORY' as any,
                            question: lastAsst.content,
                            order: 1,
                            followUpPotential: [],
                        });
                    }

                    // Speak the existing question
                    await this.speakQuestion(connection, lastAsst.content, 'INTRODUCTORY');
                } else {
                    // No assistant question exists — fallback to generating one
                    logger.info('[Mock WS Gateway] Generating fresh opening question', { id: connection.socket.id });
                    await this.generateAndSpeakOpening(connection);
                }
            } else {
                // Resume mid-interview: re-speak the last unanswered question
                const lastAsst = connection.workingData!.conversation
                    .filter(m => m.role === 'assistant')
                    .slice(-1)[0];
                if (lastAsst) {
                    await this.speakQuestion(connection, lastAsst.content, 'TECHNICAL');
                } else {
                    connection.isListening = true;
                    this.sendSessionState(connection);
                }
            }

            if (connection.pendingAudioChunks.length > 0 && connection.transcriber) {
                for (const chunk of connection.pendingAudioChunks) {
                    connection.transcriber.sendAudio(chunk);
                }
                connection.pendingAudioChunks = [];
            }

        } catch (err) {
            connection.isInitializing = false;
            throw err;
        }
    }

    private async generateAndSpeakOpening(connection: ActiveConnection): Promise<void> {
        if (!connection.context || !connection.workingData) return;

        // Mark both flags: AI is speaking and NOT listening so frontend audio is discarded
        connection.isAISpeaking = true;
        connection.isListening = false;
        try {
            const opening = await conversationEngineService.generateOpening(connection.context, {
                sessionId: connection.socket.attemptId,
                userId: connection.socket.userId,
            });

            // Add opening question to context so questionsAsked count is correct
            connection.context.questionsAsked.push({
                id: nanoid(),
                category: 'INTRODUCTORY' as any,
                question: opening.question,
                order: 1,
                followUpPotential: [],
            });

            const assistantMsg = {
                id: nanoid(),
                role: 'assistant' as const,
                content: opening.question,
                timestamp: new Date().toISOString()
            };

            connection.workingData.conversation.push(assistantMsg);

            // Persist it immediately
            await prisma.mockDriveModuleAttempt.update({
                where: { id: connection.socket.attemptId },
                data: { moduleData: connection.workingData as any }
            });

            this.send(connection.socket, {
                type: WS_EVENTS.SERVER.AI_SPEAKING,
                data: { text: opening.question, category: opening.category, id: assistantMsg.id }
            });

            for await (const audioChunk of textToSpeechService.streamSynthesize(opening.question)) {
                if (!this.connections.has(connection.socket.id)) return;
                this.send(connection.socket, {
                    type: WS_EVENTS.SERVER.AI_AUDIO,
                    data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' }
                });
            }
            this.send(connection.socket, { type: WS_EVENTS.SERVER.AI_DONE, data: { questionId: assistantMsg.id } });
            // Transition frontend to INTERVIEWING so mic auto-starts after audio playback ends
            this.sendSessionState(connection);

        } finally {
            connection.isAISpeaking = false;
            // AUTO-LISTEN: ensure backend is listening after opening question
            connection.isListening = true;
            logger.debug('[Mock WS Gateway] AI opening done, isListening=true', { id: connection.socket.id });
        }
    }

    private async speakQuestion(connection: ActiveConnection, text: string, category: string): Promise<void> {
        // Block listening immediately so any residual frontend audio is discarded
        connection.isAISpeaking = true;
        connection.isListening = false;
        try {
            this.send(connection.socket, {
                type: WS_EVENTS.SERVER.AI_SPEAKING,
                data: { text, category }
            });
            for await (const audioChunk of textToSpeechService.streamSynthesize(text)) {
                if (!this.connections.has(connection.socket.id)) return;
                this.send(connection.socket, {
                    type: WS_EVENTS.SERVER.AI_AUDIO,
                    data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' }
                });
            }
            this.send(connection.socket, { type: WS_EVENTS.SERVER.AI_DONE, data: {} });
            // Transition frontend to INTERVIEWING so mic auto-starts after audio playback ends
            this.sendSessionState(connection);
        } finally {
            connection.isAISpeaking = false;
            // AUTO-LISTEN: ensure backend is listening after follow-up question
            connection.isListening = true;
            logger.debug('[Mock WS Gateway] AI question done, isListening=true', { id: connection.socket.id });
        }
    }

    private async handleMessage(connection: ActiveConnection, message: any): Promise<void> {
        const { type, data } = message;
        switch (type) {
            case WS_EVENTS.CLIENT.START_RECORDING:
                if (connection.isInitialized && !connection.isAISpeaking) {
                    connection.isListening = true;
                    connection.currentTranscript = '';
                    logger.debug('[Mock WS Gateway] START_RECORDING received', { id: connection.socket.id });
                } else {
                    logger.warn('[Mock WS Gateway] START_RECORDING ignored (not initialized or AI speaking)', { id: connection.socket.id });
                }
                break;
            case WS_EVENTS.CLIENT.AUDIO_CHUNK:
                if (connection.isListening && !connection.isAISpeaking && connection.transcriber) {
                    try {
                        // Frontend sends base64 encoded audio in data.response
                        if (data && data.response && typeof data.response === 'string') {
                            const buffer = Buffer.from(data.response, 'base64');
                            if (buffer.length > 0) {
                                connection.transcriber.sendAudio(buffer);
                            } else {
                                // Fallback if it was plain text
                                connection.currentTranscript += ' ' + data.response;
                                this.scheduleResponseProcessing(connection);
                            }
                        }
                    } catch (e) {
                        logger.error('[Mock WS Gateway] Error processing USER_ANSWER audio', e);
                    }
                } else {
                    if (data?.response?.length > 100) {
                        logger.warn('[Mock WS Gateway] JSON AUDIO_CHUNK dropped', {
                            id: connection.socket.id,
                            isListening: connection.isListening,
                            isAISpeaking: connection.isAISpeaking,
                            hasTranscriber: !!connection.transcriber
                        });
                    }
                }
                break;
            case WS_EVENTS.CLIENT.STOP_RECORDING:
                logger.debug('[Mock WS Gateway] STOP_RECORDING received', { id: connection.socket.id });
                connection.isListening = false;
                // Cancel any pending auto-submit timer (prevents double-submission)
                if (this.responseProcessingTimeout.has(connection.socket.id)) {
                    clearTimeout(this.responseProcessingTimeout.get(connection.socket.id)!);
                    this.responseProcessingTimeout.delete(connection.socket.id);
                }
                // Cancel any prior stop-recording wait timer
                if (connection.stopRecordingWaitTimer) {
                    clearTimeout(connection.stopRecordingWaitTimer);
                    connection.stopRecordingWaitTimer = null;
                }
                // We always wait 1000ms for Deepgram to deliver the last final transcript.
                // If currentTranscript already has content the wait will still proceed so we
                // capture any in-flight final result that arrives shortly after stop.
                connection.stopRecordingWaitTimer = setTimeout(async () => {
                    connection.stopRecordingWaitTimer = null;
                    const transcript = connection.currentTranscript.trim();
                    if (transcript.length > 0 && !connection.isAISpeaking && !connection.isProcessingResponse) {
                        connection.currentTranscript = '';
                        await this.processUserResponse(connection, transcript);
                    } else if (transcript.length === 0) {
                        logger.warn('[Mock WS Gateway] STOP_RECORDING: no transcript captured, skipping');
                    }
                }, 1000);
                break;
            case WS_EVENTS.CLIENT.END_INTERVIEW:
                await this.endMockDriveInterview(connection, data?.reason || 'completed');
                break;
            case WS_EVENTS.CLIENT.PAUSE:
                connection.isListening = false;
                break;
            case WS_EVENTS.CLIENT.RESUME:
                if (connection.isInitialized && !connection.isAISpeaking) connection.isListening = true;
                break;
            case 'ping':
            case WS_EVENTS.CLIENT.PING:
                connection.socket.isAlive = true;
                connection.socket.lastPongTime = Date.now();
                this.send(connection.socket, { type: WS_EVENTS.SERVER.PONG });
                break;
            case WS_EVENTS.CLIENT.PONG:
            case 'pong':
                connection.socket.isAlive = true;
                connection.socket.lastPongTime = Date.now();
                break;
        }
    }

    private async handleAudioData(connection: ActiveConnection, audioBuffer: Buffer): Promise<void> {
        if (audioBuffer.length < 100) return;
        if (!connection.isInitialized) {
            if (connection.pendingAudioChunks.length < 100) connection.pendingAudioChunks.push(audioBuffer);
            return;
        }
        if (!connection.isListening || connection.isAISpeaking) {
            // Log once every 50 dropped chunks to avoid flooding
            if (!connection.pendingAudioChunks.length || connection.pendingAudioChunks.length % 50 === 0) {
                logger.debug('[Mock WS Gateway] Audio dropped (not listening or AI speaking)', { 
                    id: connection.socket.id, 
                    isListening: connection.isListening, 
                    isAISpeaking: connection.isAISpeaking 
                });
            }
            return;
        }
        
        if (connection.transcriber) {
            connection.transcriber.sendAudio(audioBuffer);
        } else {
            logger.warn('[Mock WS Gateway] BINARY AUDIO_CHUNK dropped: No transcriber', { id: connection.socket.id });
        }
    }

    private handleTranscription(connection: ActiveConnection, result: { text: string; isFinal: boolean; confidence: number }): void {
        const liveText = (connection.currentTranscript + ' ' + result.text).trim();
        this.send(connection.socket, {
            type: result.isFinal ? WS_EVENTS.SERVER.TRANSCRIPTION_FINAL : WS_EVENTS.SERVER.TRANSCRIPTION,
            data: { text: liveText, isFinal: result.isFinal, confidence: result.confidence },
        });

        if (result.isFinal && result.text.trim().length > 0) {
            connection.currentTranscript += ' ' + result.text;
            if (result.text.trim().length > 10) {
                this.scheduleResponseProcessing(connection);
            }
        }
    }

    private scheduleResponseProcessing(connection: ActiveConnection): void {
        // This is a fallback auto-submit — only fires if STOP_RECORDING wasn't received.
        // Now that STOP_RECORDING has a 1s wait, this timeout should rarely be needed.
        const existing = this.responseProcessingTimeout.get(connection.socket.id);
        if (existing) clearTimeout(existing);

        const timeout = setTimeout(async () => {
            this.responseProcessingTimeout.delete(connection.socket.id);
            // Guard: skip if already processing or stop-recording timer is pending
            if (
                connection.currentTranscript.trim().length > 10 &&
                !connection.isAISpeaking &&
                !connection.isProcessingResponse &&
                connection.isListening // Only auto-submit if still in listening state (not stopped)
            ) {
                await this.processUserResponse(connection, connection.currentTranscript.trim());
                connection.currentTranscript = '';
            }
        }, 8000); // Increased to 8s — frontend VAD at 5s handles normal flow; this is last resort

        this.responseProcessingTimeout.set(connection.socket.id, timeout);
    }

    private handleTranscriberError(connection: ActiveConnection, error: Error): void {
        this.sendError(connection.socket, 'TRANSCRIPTION_ERROR', 'Speech recognition error');
    }

    private handleTranscriberClose(connection: ActiveConnection): void {
        // Always attempt to reconnect the transcriber if the interview connection is still active.
        // Previously this was gated on connection.isListening, which meant the transcriber
        // would NOT be reconnected if it closed while the AI was speaking (isListening=false).
        // That caused all subsequent user turns to have no transcription.
        if (this.connections.has(connection.socket.id) && connection.isInitialized) {
            this.reconnectTranscriber(connection);
        }
    }

    private async reconnectTranscriber(connection: ActiveConnection): Promise<void> {
        try {
            connection.transcriber = speechToTextService.createRealtimeTranscriber({
                onTranscript: (result) => this.handleTranscription(connection, result),
                onError: (error) => this.handleTranscriberError(connection, error),
                onClose: () => this.handleTranscriberClose(connection),
            });
            await connection.transcriber.start();
        } catch (e) { /* ignore */ }
    }

    private async processUserResponse(connection: ActiveConnection, response: string): Promise<void> {
        if (!connection.context || !connection.workingData) return;
        // Re-entrancy guard: prevent double-processing the same answer
        if (connection.isProcessingResponse) {
            logger.warn('[Mock WS Gateway] processUserResponse called while already processing — skipping');
            return;
        }
        connection.isProcessingResponse = true;

        this.send(connection.socket, { type: WS_EVENTS.SERVER.AI_THINKING });

        // Store user message
        connection.workingData.conversation.push({
            id: nanoid(),
            role: 'user',
            content: response,
            timestamp: new Date().toISOString()
        });

        try {
            // Identify the question being answered
            const lastAssisMsgIndex = connection.workingData.conversation.map(m => m.role).lastIndexOf('assistant');
            const questionContent = lastAssisMsgIndex >= 0 ? connection.workingData.conversation[lastAssisMsgIndex].content : 'Question';
            const questionCat = "TECHNICAL"; // Assuming TECHNICAL is a valid Enum value for AiInterviewQuestionCategory

            // Analyze the response via AI engine
            const analysis = await conversationEngineService.scoreResponse(
                questionContent,
                response,
                questionCat as any,
                connection.context,
                {
                    sessionId: connection.socket.attemptId,
                    userId: connection.socket.userId,
                }
            );

            // Build out the Mock Drive response object format
            connection.workingData.responses.push({
                id: nanoid(),
                questionIndex: connection.workingData.responses.length + 1,
                category: questionCat as any,
                question: questionContent,
                answer: response,
                isFollowup: false,
                scores: {
                    relevance: analysis.scores?.relevance || 0,
                    clarity: analysis.scores?.clarity || 0,
                    depth: analysis.scores?.depth || 0,
                    technicalAccuracy: analysis.scores?.technicalAccuracy || null,
                    overall: analysis.scores?.overall || 0
                },
                feedback: analysis.feedback,
                timeTakenSeconds: 30, // Mock time
                answeredAt: new Date().toISOString()
            });

            // Advance state and persist
            await prisma.mockDriveModuleAttempt.update({
                where: { id: connection.socket.attemptId },
                data: { moduleData: connection.workingData as any }
            });

            this.sendSessionState(connection);

            // Are we done? Use workingData.responses.length (persisted count) rather than
            // questionsAsked.length (in-memory, can differ on reconnect).
            const answeredCount = connection.workingData!.responses.length;
            const targetCount = connection.context!.config.targetQuestions;
            logger.debug('[Mock WS] Progress check', { answeredCount, targetCount });
            if (answeredCount >= targetCount) {
                await this.endMockDriveInterview(connection, 'completed');
                return;
            }

            // Generate next question
            connection.isAISpeaking = true;
            const nextQuestion = await conversationEngineService.generateNextQuestion(
                connection.context,
                undefined,
                {
                    sessionId: connection.socket.attemptId,
                    userId: connection.socket.userId,
                }
            );

            const newAssisMsg = {
                id: nanoid(),
                role: 'assistant' as const,
                content: nextQuestion.question,
                timestamp: new Date().toISOString()
            };
            connection.workingData.conversation.push(newAssisMsg);

            await prisma.mockDriveModuleAttempt.update({
                where: { id: connection.socket.attemptId },
                data: { moduleData: connection.workingData as any }
            });

            await this.speakQuestion(connection, nextQuestion.question, nextQuestion.category);

        } catch (error) {
            logger.error('[Mock WS Gateway] Response processing failed', error);
            this.sendError(connection.socket, 'PROCESSING_ERROR', 'Failed to process response');
        } finally {
            connection.isProcessingResponse = false;
        }
    }

    private async endMockDriveInterview(connection: ActiveConnection, reason: string): Promise<void> {
        if (!connection.workingData) return;

        logger.info('[Mock WS Gateway] Ending interview', { attemptId: connection.socket.attemptId, reason });

        // Mark only the MODULE attempt as COMPLETED.
        // The parent MockDriveAttempt will be finalized by the submitModule API
        // call triggered from the frontend's onSubmit() callback.
        // This ensures scores, leaderboard, and attempt completion happen in the
        // proper service layer with correct data.
        await prisma.mockDriveModuleAttempt.update({
            where: { id: connection.socket.attemptId },
            data: { status: 'COMPLETED', completedAt: new Date() }
        });

        const attemptDataObj = await prisma.mockDriveModuleAttempt.findUnique({
            where: { id: connection.socket.attemptId },
            include: { attempt: true }
        });

        this.send(connection.socket, {
            type: WS_EVENTS.SERVER.INTERVIEW_ENDED,
            data: { feedbackUrl: `/student/mock-drive/${attemptDataObj?.attempt?.mockDriveId || ''}/results` }
        });

        setTimeout(() => {
            this.cleanupConnection(connection.socket.id);
        }, 1000);
    }

    private sendSessionState(connection: ActiveConnection): void {
        if (!connection.context || !connection.workingData) return;
        const progress = Math.min(100, Math.round((connection.workingData.responses.length / connection.context.config.targetQuestions) * 100));

        this.send(connection.socket, {
            type: WS_EVENTS.SERVER.SESSION_STATE,
            data: {
                progress,
                currentQuestion: conversationEngineService.getCurrentQuestionState(connection.context),
                isListening: connection.isListening,
                isAISpeaking: connection.isAISpeaking
            }
        });
    }

    private send(socket: WebSocket, payload: any): void {
        if (socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify({ ...payload, timestamp: Date.now() }));
            } catch (error) {
                logger.error('[Mock WS Gateway] Send error', error);
            }
        }
    }

    private sendError(socket: WebSocket, code: string, message: string): void {
        this.send(socket, {
            type: WS_EVENTS.SERVER.ERROR,
            data: { code, message, recoverable: true }
        });
    }

    private cleanupConnection(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        if (this.responseProcessingTimeout.has(connectionId)) {
            clearTimeout(this.responseProcessingTimeout.get(connectionId)!);
            this.responseProcessingTimeout.delete(connectionId);
        }

        // Clear the stop-recording wait timer to prevent dangling async callbacks
        if (connection.stopRecordingWaitTimer) {
            clearTimeout(connection.stopRecordingWaitTimer);
            connection.stopRecordingWaitTimer = null;
        }

        if (connection.transcriber) {
            try { connection.transcriber.stop(); } catch (e) { }
        }

        // Use code 1000 (Normal Closure) so the browser sees a clean close, not 1005
        if (connection.socket.readyState === WebSocket.OPEN || connection.socket.readyState === WebSocket.CONNECTING) {
            try { connection.socket.close(1000, 'Interview session ended'); } catch (e) { }
        }

        this.connections.delete(connectionId);
    }
}

export const mockInterviewGateway = new MockInterviewWebSocketGateway();
