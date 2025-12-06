"use strict";
// src/module/practice/interview/websocket/interview.gateway.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewWebSocketGateway = exports.interviewGateway = void 0;
const ws_1 = require("ws");
const nanoid_1 = require("nanoid");
const jose_1 = require("jose");
const db_1 = require("../../../../lib/db");
const logger_1 = require("../../../../utils/logger");
const services_1 = require("../services");
const interview_constants_1 = require("../interview.constants");
// =====================================================
// GATEWAY CLASS
// =====================================================
class InterviewWebSocketGateway {
    wss = null;
    connections = new Map();
    heartbeatInterval = null;
    responseProcessingTimeout = new Map();
    jwtSecret = null;
    getJwtSecret() {
        if (!this.jwtSecret) {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET environment variable is not set');
            }
            this.jwtSecret = new TextEncoder().encode(secret);
        }
        return this.jwtSecret;
    }
    /**
     * Initialize WebSocket server
     */
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({ noServer: true });
        server.on('upgrade', (request, socket, head) => {
            this.handleUpgrade(request, socket, head);
        });
        this.wss.on('connection', (ws, request, session) => {
            this.onConnection(ws, session);
        });
        this.startHeartbeat();
        logger_1.logger.info('[WS Gateway] WebSocket server initialized', {
            path: '/ws/interview/:sessionId',
        });
    }
    /**
     * Handle HTTP upgrade request
     */
    async handleUpgrade(request, socket, head) {
        const url = new URL(request.url || '', `http://${request.headers.host}`);
        const pathname = url.pathname;
        const match = pathname.match(/^\/ws\/interview\/([a-zA-Z0-9_-]+)$/);
        if (!match) {
            return;
        }
        const sessionId = match[1];
        logger_1.logger.debug('[WS Gateway] Upgrade request received', { sessionId, pathname });
        try {
            const token = url.searchParams.get('token');
            if (!token) {
                logger_1.logger.warn('[WS Gateway] No token provided', { sessionId });
                this.rejectUpgrade(socket, 401, 'Authentication required');
                return;
            }
            const userId = await this.authenticateToken(token);
            if (!userId) {
                logger_1.logger.warn('[WS Gateway] Invalid token', { sessionId });
                this.rejectUpgrade(socket, 401, 'Invalid or expired token');
                return;
            }
            const session = await db_1.prisma.aiInterviewSession.findFirst({
                where: { id: sessionId, userId },
                include: { resume: true },
            });
            if (!session) {
                logger_1.logger.warn('[WS Gateway] Session not found', { sessionId, userId });
                this.rejectUpgrade(socket, 404, 'Session not found');
                return;
            }
            if (!['CREATED', 'STARTED', 'IN_PROGRESS'].includes(session.status)) {
                logger_1.logger.warn('[WS Gateway] Session not active', { sessionId, status: session.status });
                this.rejectUpgrade(socket, 400, 'Session is not active');
                return;
            }
            // Close existing connection for this session
            const existingConnection = this.findConnectionBySessionId(sessionId);
            if (existingConnection) {
                logger_1.logger.info('[WS Gateway] Closing existing connection for session', { sessionId });
                this.cleanupConnection(existingConnection.socket.id);
            }
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                const authSocket = ws;
                authSocket.id = (0, nanoid_1.nanoid)();
                authSocket.userId = userId;
                authSocket.sessionId = sessionId;
                authSocket.isAlive = true;
                authSocket.lastPongTime = Date.now();
                this.wss.emit('connection', authSocket, request, session);
            });
            logger_1.logger.info('[WS Gateway] Upgrade successful', { sessionId, userId });
        }
        catch (error) {
            logger_1.logger.error('[WS Gateway] Upgrade error', { sessionId, error });
            this.rejectUpgrade(socket, 500, 'Internal server error');
        }
    }
    findConnectionBySessionId(sessionId) {
        for (const connection of this.connections.values()) {
            if (connection.socket.sessionId === sessionId) {
                return connection;
            }
        }
        return undefined;
    }
    rejectUpgrade(socket, statusCode, message) {
        const statusMessages = {
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
    async authenticateToken(token) {
        try {
            const secret = this.getJwtSecret();
            const { payload } = await (0, jose_1.jwtVerify)(token, secret);
            const jwtPayload = payload;
            const userId = jwtPayload.sub || jwtPayload.id;
            if (typeof userId !== 'string') {
                logger_1.logger.warn('[WS Gateway] Invalid token payload - missing user ID');
                return null;
            }
            return userId;
        }
        catch (error) {
            if (error instanceof Error) {
                logger_1.logger.warn('[WS Gateway] Token verification failed', {
                    error: error.message,
                    name: error.name,
                });
            }
            return null;
        }
    }
    /**
     * Handle new authenticated WebSocket connection
     */
    async onConnection(socket, session) {
        const connectionId = socket.id;
        logger_1.logger.info('[WS Gateway] New connection', {
            connectionId,
            sessionId: socket.sessionId,
            userId: socket.userId,
        });
        // Initialize connection state
        const connection = {
            socket,
            transcriber: null,
            context: null,
            isListening: false,
            isAISpeaking: false,
            currentTranscript: '',
            lastActivity: new Date(),
            isInitialized: false,
            isInitializing: false,
            pendingAudioChunks: [],
        };
        this.connections.set(connectionId, connection);
        // Setup event handlers
        this.setupSocketHandlers(socket, connection);
        // Send connected confirmation
        this.send(socket, {
            type: interview_constants_1.WS_EVENTS.SERVER.CONNECTED,
            data: {
                connectionId,
                sessionId: socket.sessionId,
                status: session.status,
            },
        });
        // Initialize interview (async)
        try {
            await this.initializeInterview(connection, session);
        }
        catch (error) {
            logger_1.logger.error('[WS Gateway] Interview initialization failed', error);
            this.sendError(socket, 'INIT_ERROR', 'Failed to initialize interview');
        }
    }
    /**
     * Setup WebSocket event handlers
     */
    setupSocketHandlers(socket, connection) {
        socket.on('message', async (data) => {
            connection.lastActivity = new Date();
            try {
                if (this.isBinaryData(data)) {
                    const buffer = this.toBuffer(data);
                    await this.handleAudioData(connection, buffer);
                }
                else {
                    const message = JSON.parse(data.toString());
                    await this.handleMessage(connection, message);
                }
            }
            catch (error) {
                logger_1.logger.error('[WS Gateway] Message handling error', error);
                this.sendError(socket, 'MESSAGE_ERROR', 'Failed to process message');
            }
        });
        socket.on('pong', () => {
            socket.isAlive = true;
            socket.lastPongTime = Date.now();
            logger_1.logger.debug('[WS Gateway] Protocol pong received', { id: socket.id });
        });
        socket.on('close', (code, reason) => {
            logger_1.logger.info('[WS Gateway] Connection closed', {
                id: socket.id,
                code,
                reason: reason?.toString() || 'unknown',
            });
            this.cleanupConnection(socket.id);
        });
        socket.on('error', (error) => {
            logger_1.logger.error('[WS Gateway] Socket error', { id: socket.id, error });
            this.cleanupConnection(socket.id);
        });
    }
    isBinaryData(data) {
        return Buffer.isBuffer(data) || data instanceof ArrayBuffer || ArrayBuffer.isView(data);
    }
    toBuffer(data) {
        if (Buffer.isBuffer(data))
            return data;
        if (data instanceof ArrayBuffer)
            return Buffer.from(new Uint8Array(data));
        if (ArrayBuffer.isView(data))
            return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        if (Array.isArray(data))
            return Buffer.concat(data);
        throw new Error('Unsupported data type');
    }
    // ===================================================
    // INTERVIEW INITIALIZATION
    // ===================================================
    async initializeInterview(connection, session) {
        const { socket } = connection;
        if (connection.isInitialized) {
            logger_1.logger.warn('[WS Gateway] Interview already initialized', { sessionId: socket.sessionId });
            return;
        }
        if (connection.isInitializing) {
            logger_1.logger.warn('[WS Gateway] Interview initialization already in progress', { sessionId: socket.sessionId });
            return;
        }
        connection.isInitializing = true;
        try {
            // Parse resume if available
            let parsedResume = null;
            if (session.resumeId) {
                try {
                    parsedResume = await services_1.resumeParserService.parseResumeById(socket.userId, session.resumeId);
                }
                catch (error) {
                    logger_1.logger.warn('[WS Gateway] Resume parsing failed, continuing without', error);
                }
            }
            // Initialize conversation context
            connection.context = await services_1.conversationEngineService.initializeContext(parsedResume || this.createMinimalResume(), {
                jobTitle: session.jobTitle || 'Software Engineer',
                companyName: session.companyName,
                difficulty: session.difficulty,
                focusAreas: session.focusAreas,
                targetQuestions: session.totalQuestions,
            });
            // Initialize STT - MUST happen before setting isInitialized
            try {
                connection.transcriber = services_1.speechToTextService.createRealtimeTranscriber({
                    onTranscript: (result) => this.handleTranscription(connection, result),
                    onError: (error) => this.handleTranscriberError(connection, error),
                    onClose: () => this.handleTranscriberClose(connection),
                });
                await connection.transcriber.start();
                logger_1.logger.info('[WS Gateway] Transcriber started successfully', { sessionId: socket.sessionId });
            }
            catch (error) {
                logger_1.logger.error('[WS Gateway] STT initialization failed', error);
                connection.transcriber = null;
            }
            // Generate opening if session is new
            if (session.status === 'CREATED' || session.status === 'STARTED') {
                await this.generateAndSpeakOpening(connection, session);
            }
            // Mark as initialized and ready to listen
            connection.isInitialized = true;
            connection.isInitializing = false;
            connection.isListening = true;
            // Send session ready
            this.send(socket, {
                type: interview_constants_1.WS_EVENTS.SERVER.SESSION_READY,
                data: {
                    sessionId: socket.sessionId,
                    status: 'ready',
                    currentQuestion: connection.context
                        ? services_1.conversationEngineService.getCurrentQuestionState(connection.context)
                        : null,
                },
            });
            logger_1.logger.info('[WS Gateway] Interview initialized', {
                sessionId: socket.sessionId,
                hasTranscriber: !!connection.transcriber,
                isListening: connection.isListening,
                pendingChunks: connection.pendingAudioChunks.length,
            });
            // Process any queued audio chunks
            if (connection.pendingAudioChunks.length > 0) {
                logger_1.logger.info('[WS Gateway] Processing queued audio', {
                    sessionId: socket.sessionId,
                    chunks: connection.pendingAudioChunks.length,
                });
                if (connection.transcriber) {
                    for (const chunk of connection.pendingAudioChunks) {
                        connection.transcriber.sendAudio(chunk);
                    }
                }
                connection.pendingAudioChunks = [];
            }
        }
        catch (error) {
            connection.isInitializing = false;
            throw error;
        }
    }
    async generateAndSpeakOpening(connection, session) {
        if (!connection.context)
            return;
        const { socket } = connection;
        // Check if opening already exists for this session
        const existingOpening = await db_1.prisma.aiInterviewResponse.findFirst({
            where: {
                sessionId: socket.sessionId,
                questionOrder: 0,
            },
        });
        if (existingOpening) {
            logger_1.logger.info('[WS Gateway] Opening already exists, using existing', {
                sessionId: socket.sessionId,
                responseId: existingOpening.id,
            });
            connection.isAISpeaking = true;
            // Send existing opening text
            this.send(socket, {
                type: interview_constants_1.WS_EVENTS.SERVER.AI_SPEAKING,
                data: { text: existingOpening.question, category: existingOpening.category },
            });
            // Stream TTS for existing opening
            try {
                for await (const audioChunk of services_1.textToSpeechService.streamSynthesize(existingOpening.question)) {
                    if (!this.connections.has(socket.id))
                        return;
                    this.send(socket, {
                        type: interview_constants_1.WS_EVENTS.SERVER.AI_AUDIO,
                        data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
                    });
                }
            }
            catch (ttsError) {
                logger_1.logger.warn('[WS Gateway] TTS failed for existing opening', ttsError);
            }
            this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.AI_DONE, data: { questionId: existingOpening.id } });
            connection.isAISpeaking = false;
            return;
        }
        // Generate new opening
        logger_1.logger.info('[WS Gateway] Generating new opening', { sessionId: socket.sessionId });
        connection.isAISpeaking = true;
        try {
            const opening = await services_1.conversationEngineService.generateOpening(connection.context);
            this.send(socket, {
                type: interview_constants_1.WS_EVENTS.SERVER.AI_SPEAKING,
                data: { text: opening.question, category: opening.category },
            });
            // Stream TTS
            try {
                for await (const audioChunk of services_1.textToSpeechService.streamSynthesize(opening.question)) {
                    if (!this.connections.has(socket.id))
                        return;
                    this.send(socket, {
                        type: interview_constants_1.WS_EVENTS.SERVER.AI_AUDIO,
                        data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
                    });
                }
            }
            catch (ttsError) {
                logger_1.logger.warn('[WS Gateway] TTS failed for opening', ttsError);
            }
            this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.AI_DONE, data: { questionId: opening.question } });
            // Update session status if needed
            if (session.status === 'CREATED') {
                await db_1.prisma.aiInterviewSession.update({
                    where: { id: socket.sessionId },
                    data: { status: 'STARTED', startedAt: new Date() },
                });
            }
            // Store opening question
            await db_1.prisma.aiInterviewResponse.create({
                data: {
                    sessionId: socket.sessionId,
                    category: opening.category,
                    question: opening.question,
                    answer: '',
                    questionOrder: 0,
                    isFollowup: false,
                },
            });
            logger_1.logger.info('[WS Gateway] Opening generated and stored', {
                sessionId: socket.sessionId,
            });
        }
        finally {
            connection.isAISpeaking = false;
        }
    }
    // ===================================================
    // MESSAGE HANDLING
    // ===================================================
    async handleMessage(connection, message) {
        const { socket } = connection;
        const { type, data } = message;
        connection.lastActivity = new Date();
        logger_1.logger.debug('[WS Gateway] Message received', { type, sessionId: socket.sessionId });
        switch (type) {
            case interview_constants_1.WS_EVENTS.CLIENT.START_RECORDING:
                if (connection.isInitialized && !connection.isAISpeaking) {
                    connection.isListening = true;
                    connection.currentTranscript = '';
                    logger_1.logger.info('[WS Gateway] Recording started', { sessionId: socket.sessionId });
                }
                else {
                    logger_1.logger.warn('[WS Gateway] Cannot start recording', {
                        isInitialized: connection.isInitialized,
                        isAISpeaking: connection.isAISpeaking,
                    });
                }
                break;
            case interview_constants_1.WS_EVENTS.CLIENT.STOP_RECORDING:
                connection.isListening = false;
                logger_1.logger.info('[WS Gateway] Recording stopped', {
                    sessionId: socket.sessionId,
                    transcriptLength: connection.currentTranscript.trim().length,
                });
                // Clear any pending processing timeout
                const existingTimeout = this.responseProcessingTimeout.get(socket.id);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                    this.responseProcessingTimeout.delete(socket.id);
                }
                // Process if we have any transcript
                if (connection.currentTranscript.trim().length > 0) {
                    await this.processUserResponse(connection, connection.currentTranscript.trim());
                    connection.currentTranscript = '';
                }
                else {
                    logger_1.logger.warn('[WS Gateway] No transcript to process', { sessionId: socket.sessionId });
                    // Wait a bit for late transcriptions
                    setTimeout(async () => {
                        if (connection.currentTranscript.trim().length > 0 && !connection.isAISpeaking) {
                            logger_1.logger.info('[WS Gateway] Late transcript arrived, processing', {
                                transcript: connection.currentTranscript.substring(0, 50),
                            });
                            await this.processUserResponse(connection, connection.currentTranscript.trim());
                            connection.currentTranscript = '';
                        }
                    }, 1500);
                }
                break;
            case interview_constants_1.WS_EVENTS.CLIENT.END_INTERVIEW:
                await this.endInterview(connection, data?.reason || 'completed');
                break;
            case interview_constants_1.WS_EVENTS.CLIENT.PAUSE:
                connection.isListening = false;
                break;
            case interview_constants_1.WS_EVENTS.CLIENT.RESUME:
                if (connection.isInitialized && !connection.isAISpeaking) {
                    connection.isListening = true;
                }
                break;
            case interview_constants_1.WS_EVENTS.CLIENT.PING:
            case 'ping':
                socket.isAlive = true;
                socket.lastPongTime = Date.now();
                logger_1.logger.debug('[WS Gateway] Application ping received, sending pong', {
                    sessionId: socket.sessionId,
                });
                this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.PONG });
                break;
            case interview_constants_1.WS_EVENTS.CLIENT.PONG:
            case 'pong':
                socket.isAlive = true;
                socket.lastPongTime = Date.now();
                break;
            default:
                logger_1.logger.warn('[WS Gateway] Unknown message type', { type });
        }
    }
    async handleAudioData(connection, audioBuffer) {
        // Skip tiny buffers (likely just headers or noise)
        if (audioBuffer.length < 100) {
            return;
        }
        logger_1.logger.debug('[WS Gateway] Audio data received', {
            sessionId: connection.socket.sessionId,
            bufferSize: audioBuffer.length,
            isListening: connection.isListening,
            isAISpeaking: connection.isAISpeaking,
            hasTranscriber: !!connection.transcriber,
            isInitialized: connection.isInitialized,
            isInitializing: connection.isInitializing,
        });
        // If not initialized yet, queue the audio
        if (!connection.isInitialized) {
            if (connection.pendingAudioChunks.length < 100) { // Limit queue size
                connection.pendingAudioChunks.push(audioBuffer);
                logger_1.logger.debug('[WS Gateway] Queueing audio - not initialized yet', {
                    sessionId: connection.socket.sessionId,
                    queueSize: connection.pendingAudioChunks.length,
                });
            }
            return;
        }
        if (!connection.isListening) {
            logger_1.logger.debug('[WS Gateway] Ignoring audio - not listening', {
                sessionId: connection.socket.sessionId,
            });
            return;
        }
        if (connection.isAISpeaking) {
            logger_1.logger.debug('[WS Gateway] Ignoring audio - AI is speaking', {
                sessionId: connection.socket.sessionId,
            });
            return;
        }
        if (connection.transcriber) {
            connection.transcriber.sendAudio(audioBuffer);
        }
        else {
            logger_1.logger.warn('[WS Gateway] No transcriber available!', {
                sessionId: connection.socket.sessionId,
            });
        }
    }
    // ===================================================
    // TRANSCRIPTION HANDLING
    // ===================================================
    handleTranscription(connection, result) {
        const { socket } = connection;
        logger_1.logger.info('[WS Gateway] Transcription received', {
            sessionId: socket.sessionId,
            text: result.text.substring(0, 100),
            isFinal: result.isFinal,
            confidence: result.confidence,
        });
        this.send(socket, {
            type: result.isFinal ? interview_constants_1.WS_EVENTS.SERVER.TRANSCRIPTION_FINAL : interview_constants_1.WS_EVENTS.SERVER.TRANSCRIPTION,
            data: { text: result.text, isFinal: result.isFinal, confidence: result.confidence },
        });
        if (result.isFinal && result.text.trim().length > 0) {
            connection.currentTranscript += ' ' + result.text;
            logger_1.logger.debug('[WS Gateway] Updated transcript', {
                sessionId: socket.sessionId,
                currentTranscript: connection.currentTranscript.substring(0, 100),
                totalLength: connection.currentTranscript.length,
            });
            if (result.text.trim().length > 10) {
                this.scheduleResponseProcessing(connection);
            }
        }
    }
    scheduleResponseProcessing(connection) {
        const { socket } = connection;
        const existing = this.responseProcessingTimeout.get(socket.id);
        if (existing)
            clearTimeout(existing);
        const timeout = setTimeout(async () => {
            this.responseProcessingTimeout.delete(socket.id);
            if (connection.currentTranscript.trim().length > 10 && !connection.isAISpeaking) {
                logger_1.logger.info('[WS Gateway] Auto-processing response after silence', {
                    sessionId: socket.sessionId,
                    transcriptLength: connection.currentTranscript.length,
                });
                await this.processUserResponse(connection, connection.currentTranscript.trim());
                connection.currentTranscript = '';
            }
        }, 3000); // 3 seconds of silence
        this.responseProcessingTimeout.set(socket.id, timeout);
    }
    handleTranscriberError(connection, error) {
        logger_1.logger.error('[WS Gateway] Transcriber error', {
            sessionId: connection.socket.sessionId,
            error: error.message,
        });
        this.sendError(connection.socket, 'TRANSCRIPTION_ERROR', 'Speech recognition error');
    }
    handleTranscriberClose(connection) {
        logger_1.logger.info('[WS Gateway] Transcriber connection closed', {
            sessionId: connection.socket.sessionId,
        });
        if (this.connections.has(connection.socket.id) && connection.isListening && connection.isInitialized) {
            logger_1.logger.info('[WS Gateway] Attempting to reconnect transcriber', {
                sessionId: connection.socket.sessionId,
            });
            this.reconnectTranscriber(connection);
        }
    }
    async reconnectTranscriber(connection) {
        try {
            connection.transcriber = services_1.speechToTextService.createRealtimeTranscriber({
                onTranscript: (result) => this.handleTranscription(connection, result),
                onError: (error) => this.handleTranscriberError(connection, error),
                onClose: () => this.handleTranscriberClose(connection),
            });
            await connection.transcriber.start();
            logger_1.logger.info('[WS Gateway] Transcriber reconnected', { sessionId: connection.socket.sessionId });
        }
        catch (error) {
            logger_1.logger.error('[WS Gateway] Transcriber reconnection failed', error);
        }
    }
    // ===================================================
    // RESPONSE PROCESSING
    // ===================================================
    async processUserResponse(connection, response) {
        if (!connection.context) {
            logger_1.logger.error('[WS Gateway] No context for processing response', {
                sessionId: connection.socket.sessionId,
            });
            return;
        }
        const { socket } = connection;
        connection.isListening = false;
        connection.isAISpeaking = true;
        logger_1.logger.info('[WS Gateway] Processing user response', {
            sessionId: socket.sessionId,
            responseLength: response.length,
            responsePreview: response.substring(0, 100),
        });
        try {
            this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.AI_THINKING, data: { status: 'processing' } });
            // Get current question
            const currentResponse = await db_1.prisma.aiInterviewResponse.findFirst({
                where: { sessionId: socket.sessionId, answer: '' },
                orderBy: { questionOrder: 'desc' },
            });
            if (currentResponse) {
                logger_1.logger.debug('[WS Gateway] Scoring response for question', {
                    questionId: currentResponse.id,
                    question: currentResponse.question.substring(0, 50),
                });
                const scores = await services_1.conversationEngineService.scoreResponse(currentResponse.question, response, currentResponse.category, connection.context);
                await db_1.prisma.aiInterviewResponse.update({
                    where: { id: currentResponse.id },
                    data: {
                        answer: response,
                        scoresJson: scores.scores,
                        feedbackText: scores.feedback,
                        timeTakenSeconds: Math.round((Date.now() - connection.lastActivity.getTime()) / 1000),
                    },
                });
                logger_1.logger.info('[WS Gateway] Response scored', {
                    sessionId: socket.sessionId,
                    overallScore: scores.scores.overall,
                });
            }
            // Check if should end
            if (services_1.conversationEngineService.shouldEndInterview(connection.context)) {
                logger_1.logger.info('[WS Gateway] Interview should end', { sessionId: socket.sessionId });
                await this.endInterview(connection, 'completed');
                return;
            }
            // Generate next question
            logger_1.logger.debug('[WS Gateway] Generating next question', { sessionId: socket.sessionId });
            const nextQuestion = await services_1.conversationEngineService.generateNextQuestion(connection.context, response);
            const session = await db_1.prisma.aiInterviewSession.findUnique({
                where: { id: socket.sessionId },
            });
            await db_1.prisma.aiInterviewResponse.create({
                data: {
                    sessionId: socket.sessionId,
                    category: nextQuestion.category,
                    question: nextQuestion.question,
                    answer: '',
                    questionOrder: (session?.currentQuestionIndex || 0) + 1,
                    isFollowup: nextQuestion.isFollowUp,
                },
            });
            await db_1.prisma.aiInterviewSession.update({
                where: { id: socket.sessionId },
                data: {
                    status: 'IN_PROGRESS',
                    currentQuestionIndex: { increment: 1 },
                    questions: connection.context.questionsAsked,
                },
            });
            logger_1.logger.info('[WS Gateway] Next question generated', {
                sessionId: socket.sessionId,
                category: nextQuestion.category,
                isFollowUp: nextQuestion.isFollowUp,
            });
            this.send(socket, {
                type: interview_constants_1.WS_EVENTS.SERVER.AI_SPEAKING,
                data: {
                    text: nextQuestion.question,
                    category: nextQuestion.category,
                    isFollowUp: nextQuestion.isFollowUp,
                },
            });
            // TTS
            try {
                for await (const audioChunk of services_1.textToSpeechService.streamSynthesize(nextQuestion.question)) {
                    if (!this.connections.has(socket.id))
                        return;
                    this.send(socket, {
                        type: interview_constants_1.WS_EVENTS.SERVER.AI_AUDIO,
                        data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
                    });
                }
            }
            catch (ttsError) {
                logger_1.logger.warn('[WS Gateway] TTS failed', ttsError);
            }
            this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.AI_DONE, data: { questionId: nextQuestion.question } });
            this.sendSessionState(connection);
        }
        catch (error) {
            logger_1.logger.error('[WS Gateway] Response processing error', error);
            this.sendError(socket, 'PROCESSING_ERROR', 'Failed to process response');
        }
        finally {
            connection.isAISpeaking = false;
            connection.isListening = true;
            logger_1.logger.debug('[WS Gateway] Ready for next response', {
                sessionId: socket.sessionId,
                isListening: connection.isListening,
            });
        }
    }
    // ===================================================
    // END INTERVIEW
    // ===================================================
    async endInterview(connection, reason = 'completed') {
        const { socket } = connection;
        connection.isListening = false;
        logger_1.logger.info('[WS Gateway] Ending interview', { sessionId: socket.sessionId, reason });
        try {
            if (connection.transcriber) {
                await connection.transcriber.stop();
                connection.transcriber = null;
            }
            await db_1.prisma.aiInterviewSession.update({
                where: { id: socket.sessionId },
                data: {
                    status: reason === 'cancelled' ? 'CANCELLED' : 'COMPLETED',
                    completedAt: new Date(),
                },
            });
            const closingMessage = 'Thank you for completing this interview. Your feedback will be generated shortly.';
            this.send(socket, {
                type: interview_constants_1.WS_EVENTS.SERVER.AI_SPEAKING,
                data: { text: closingMessage, category: 'CLOSING' },
            });
            try {
                for await (const audioChunk of services_1.textToSpeechService.streamSynthesize(closingMessage)) {
                    this.send(socket, {
                        type: interview_constants_1.WS_EVENTS.SERVER.AI_AUDIO,
                        data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
                    });
                }
            }
            catch (ttsError) {
                logger_1.logger.warn('[WS Gateway] TTS failed for closing', ttsError);
            }
            this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.AI_DONE });
            this.send(socket, {
                type: interview_constants_1.WS_EVENTS.SERVER.INTERVIEW_ENDED,
                data: {
                    sessionId: socket.sessionId,
                    reason,
                    feedbackUrl: `/api/practice/interview/sessions/${socket.sessionId}/feedback`,
                },
            });
            // Don't cleanup immediately - let client receive the messages
            setTimeout(() => {
                this.cleanupConnection(socket.id);
            }, 5000);
        }
        catch (error) {
            logger_1.logger.error('[WS Gateway] End interview error', error);
            this.sendError(socket, 'END_ERROR', 'Failed to end interview');
        }
    }
    // ===================================================
    // UTILITIES
    // ===================================================
    sendSessionState(connection) {
        if (!connection.context)
            return;
        const state = {
            sessionId: connection.socket.sessionId,
            status: 'IN_PROGRESS',
            currentQuestion: services_1.conversationEngineService.getCurrentQuestionState(connection.context),
            isListening: connection.isListening,
            isAISpeaking: connection.isAISpeaking,
            progress: {
                totalQuestions: connection.context.config.targetQuestions,
                currentQuestionIndex: connection.context.questionsAsked.length,
                questionsAnswered: connection.context.questionsAsked.length - 1,
                estimatedTimeRemaining: (connection.context.config.targetQuestions - connection.context.questionsAsked.length) * 120,
                percentComplete: Math.round((connection.context.questionsAsked.length / connection.context.config.targetQuestions) * 100),
            },
        };
        this.send(connection.socket, { type: interview_constants_1.WS_EVENTS.SERVER.SESSION_STATE, data: state });
    }
    send(socket, message) {
        if (socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify({ ...message, timestamp: Date.now() }));
        }
    }
    sendError(socket, code, message, recoverable = true) {
        this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.ERROR, data: { code, message, recoverable } });
    }
    cleanupConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        logger_1.logger.info('[WS Gateway] Cleaning up connection', { connectionId });
        if (connection.transcriber) {
            connection.transcriber.stop().catch(() => { });
        }
        const timeout = this.responseProcessingTimeout.get(connectionId);
        if (timeout) {
            clearTimeout(timeout);
            this.responseProcessingTimeout.delete(connectionId);
        }
        if (connection.socket.readyState === ws_1.WebSocket.OPEN) {
            connection.socket.close(1000, 'Connection closed');
        }
        this.connections.delete(connectionId);
        logger_1.logger.info('[WS Gateway] Connection cleaned up', { connectionId });
    }
    startHeartbeat() {
        const interval = interview_constants_1.HEARTBEAT_CONFIG?.INTERVAL_MS || 30000;
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            for (const [id, connection] of this.connections) {
                const { socket } = connection;
                if (!socket.isAlive) {
                    const timeSinceLastPong = now - socket.lastPongTime;
                    if (timeSinceLastPong > interval * 2) {
                        logger_1.logger.info('[WS Gateway] Terminating inactive connection', {
                            id,
                            timeSinceLastPong,
                            sessionId: socket.sessionId,
                        });
                        socket.close(4000, 'No pong received');
                        this.cleanupConnection(id);
                        continue;
                    }
                }
                socket.isAlive = false;
                if (socket.readyState === ws_1.WebSocket.OPEN) {
                    socket.ping();
                    this.send(socket, { type: interview_constants_1.WS_EVENTS.SERVER.PING });
                }
                // Check for idle timeout
                const idleTime = (now - connection.lastActivity.getTime()) / 1000;
                if (idleTime > interview_constants_1.INTERVIEW_SESSION_CONFIG.IDLE_TIMEOUT_SECONDS) {
                    logger_1.logger.info('[WS Gateway] Terminating idle connection', {
                        id,
                        idleTime,
                        sessionId: socket.sessionId,
                    });
                    this.sendError(socket, 'IDLE_TIMEOUT', 'Session terminated due to inactivity', false);
                    this.cleanupConnection(id);
                }
            }
        }, interval);
    }
    createMinimalResume() {
        return {
            rawText: '',
            structured: {
                name: 'Candidate',
                email: '',
                phone: '',
                skills: [],
                experience: [],
                education: [],
                projects: [],
            },
            hash: '',
            parsedAt: new Date(),
        };
    }
    /**
     * Shutdown the WebSocket server
     */
    shutdown() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        for (const [id] of this.connections) {
            this.cleanupConnection(id);
        }
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }
        logger_1.logger.info('[WS Gateway] WebSocket server shut down');
    }
}
exports.InterviewWebSocketGateway = InterviewWebSocketGateway;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.interviewGateway = new InterviewWebSocketGateway();
//# sourceMappingURL=interview.gateway.js.map