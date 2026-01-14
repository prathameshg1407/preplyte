import { WebSocket, WebSocketServer } from 'ws';
import type { RawData } from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import { jwtVerify } from 'jose';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import {
  conversationEngineService,
  speechToTextService,
  textToSpeechService,
  resumeParserService,
  RealtimeTranscriber,
} from '../services';
import {
  ConversationContext,
  SessionState,
  WSServerMessage,
  ParsedResume,
} from '../interview.types';
import { WS_EVENTS, INTERVIEW_SESSION_CONFIG, HEARTBEAT_CONFIG } from '../interview.constants';

// =====================================================
// TYPES
// =====================================================

interface AuthenticatedSocket extends WebSocket {
  id: string;
  userId: string;
  sessionId: string;
  isAlive: boolean;
  lastPongTime: number;
}

interface ActiveConnection {
  socket: AuthenticatedSocket;
  transcriber: RealtimeTranscriber | null;
  context: ConversationContext | null;
  isListening: boolean;
  isAISpeaking: boolean;
  currentTranscript: string;
  lastActivity: Date;
  isInitialized: boolean;
  isInitializing: boolean;
  pendingAudioChunks: Buffer[];
}

interface JWTPayload {
  sub?: string;
  id?: string;
  [key: string]: unknown;
}

// =====================================================
// GATEWAY CLASS
// =====================================================

class InterviewWebSocketGateway {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, ActiveConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private responseProcessingTimeout: Map<string, NodeJS.Timeout> = new Map();
  private jwtSecret: Uint8Array | null = null;

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

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      this.handleUpgrade(request, socket, head);
    });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage, session: any) => {
      this.onConnection(ws as AuthenticatedSocket, session);
    });

    this.startHeartbeat();

    logger.info('[WS Gateway] WebSocket server initialized', {
      path: '/ws/interview/:sessionId',
    });
  }

  /**
   * Handle HTTP upgrade request
   */
  private async handleUpgrade(
    request: IncomingMessage,
    socket: Duplex,
    head: Buffer
  ): Promise<void> {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const pathname = url.pathname;

    const match = pathname.match(/^\/ws\/interview\/([a-zA-Z0-9_-]+)$/);

    if (!match) {
      return;
    }

    const sessionId = match[1];

    logger.debug('[WS Gateway] Upgrade request received', { sessionId, pathname });

    try {
      const token = url.searchParams.get('token');

      if (!token) {
        logger.warn('[WS Gateway] No token provided', { sessionId });
        this.rejectUpgrade(socket, 401, 'Authentication required');
        return;
      }

      const userId = await this.authenticateToken(token);

      if (!userId) {
        logger.warn('[WS Gateway] Invalid token', { sessionId });
        this.rejectUpgrade(socket, 401, 'Invalid or expired token');
        return;
      }

      const session = await prisma.aiInterviewSession.findFirst({
        where: { id: sessionId, userId },
        include: { resume: true },
      });

      if (!session) {
        logger.warn('[WS Gateway] Session not found', { sessionId, userId });
        this.rejectUpgrade(socket, 404, 'Session not found');
        return;
      }

      if (!['CREATED', 'STARTED', 'IN_PROGRESS'].includes(session.status)) {
        logger.warn('[WS Gateway] Session not active', { sessionId, status: session.status });
        this.rejectUpgrade(socket, 400, 'Session is not active');
        return;
      }

      // Close existing connection for this session
      const existingConnection = this.findConnectionBySessionId(sessionId);
      if (existingConnection) {
        logger.info('[WS Gateway] Closing existing connection for session', { sessionId });
        this.cleanupConnection(existingConnection.socket.id);
      }

      this.wss!.handleUpgrade(request, socket, head, (ws) => {
        const authSocket = ws as AuthenticatedSocket;
        authSocket.id = nanoid();
        authSocket.userId = userId;
        authSocket.sessionId = sessionId;
        authSocket.isAlive = true;
        authSocket.lastPongTime = Date.now();

        this.wss!.emit('connection', authSocket, request, session);
      });

      logger.info('[WS Gateway] Upgrade successful', { sessionId, userId });

    } catch (error) {
      logger.error('[WS Gateway] Upgrade error', { sessionId, error });
      this.rejectUpgrade(socket, 500, 'Internal server error');
    }
  }

  private findConnectionBySessionId(sessionId: string): ActiveConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.socket.sessionId === sessionId) {
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

      if (typeof userId !== 'string') {
        logger.warn('[WS Gateway] Invalid token payload - missing user ID');
        return null;
      }

      return userId;
    } catch (error) {
      if (error instanceof Error) {
        logger.warn('[WS Gateway] Token verification failed', {
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
  private async onConnection(socket: AuthenticatedSocket, session: any): Promise<void> {
    const connectionId = socket.id;

    logger.info('[WS Gateway] New connection', {
      connectionId,
      sessionId: socket.sessionId,
      userId: socket.userId,
    });

    // Initialize connection state
    const connection: ActiveConnection = {
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
      type: WS_EVENTS.SERVER.CONNECTED,
      data: {
        connectionId,
        sessionId: socket.sessionId,
        status: session.status,
      },
    });

    // Initialize interview (async)
    try {
      await this.initializeInterview(connection, session);
    } catch (error) {
      logger.error('[WS Gateway] Interview initialization failed', error);
      this.sendError(socket, 'INIT_ERROR', 'Failed to initialize interview');
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocketHandlers(socket: AuthenticatedSocket, connection: ActiveConnection): void {
    socket.on('message', async (data: RawData) => {
      connection.lastActivity = new Date();

      try {
        if (this.isBinaryData(data)) {
          const buffer = this.toBuffer(data);
          await this.handleAudioData(connection, buffer);
        } else {
          const message = JSON.parse(data.toString());
          await this.handleMessage(connection, message);
        }
      } catch (error) {
        logger.error('[WS Gateway] Message handling error', error);
        this.sendError(socket, 'MESSAGE_ERROR', 'Failed to process message');
      }
    });

    socket.on('pong', () => {
      socket.isAlive = true;
      socket.lastPongTime = Date.now();
      logger.debug('[WS Gateway] Protocol pong received', { id: socket.id });
    });

    socket.on('close', (code, reason) => {
      logger.info('[WS Gateway] Connection closed', {
        id: socket.id,
        code,
        reason: reason?.toString() || 'unknown',
      });
      this.cleanupConnection(socket.id);
    });

    socket.on('error', (error) => {
      logger.error('[WS Gateway] Socket error', { id: socket.id, error });
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

  // ===================================================
  // INTERVIEW INITIALIZATION
  // ===================================================

  private async initializeInterview(connection: ActiveConnection, session: any): Promise<void> {
    const { socket } = connection;

    if (connection.isInitialized) {
      logger.warn('[WS Gateway] Interview already initialized', { sessionId: socket.sessionId });
      return;
    }

    if (connection.isInitializing) {
      logger.warn('[WS Gateway] Interview initialization already in progress', { sessionId: socket.sessionId });
      return;
    }

    connection.isInitializing = true;

    try {
      // Parse resume if available
      let parsedResume: ParsedResume | null = null;
      if (session.resumeId) {
        try {
          parsedResume = await resumeParserService.parseResumeById(socket.userId, session.resumeId);
        } catch (error) {
          logger.warn('[WS Gateway] Resume parsing failed, continuing without', error);
        }
      }

      // FIX: FETCH PREVIOUS RESPONSES FROM DB
      const previousResponses = await prisma.aiInterviewResponse.findMany({
        where: { sessionId: socket.sessionId },
        orderBy: { questionOrder: 'asc' }
      });

      // Initialize conversation context
      connection.context = await conversationEngineService.initializeContext(
        parsedResume || this.createMinimalResume(),
        {
          jobTitle: session.jobTitle || 'Software Engineer',
          companyName: session.companyName,
          difficulty: session.difficulty,
          focusAreas: session.focusAreas,
          targetQuestions: session.totalQuestions,
        },
        previousResponses
      );

      // Initialize STT
      try {
        connection.transcriber = speechToTextService.createRealtimeTranscriber({
          onTranscript: (result) => this.handleTranscription(connection, result),
          onError: (error) => this.handleTranscriberError(connection, error),
          onClose: () => this.handleTranscriberClose(connection),
        });
        await connection.transcriber.start();
        logger.info('[WS Gateway] Transcriber started successfully', { sessionId: socket.sessionId });
      } catch (error) {
        logger.error('[WS Gateway] STT initialization failed', error);
        connection.transcriber = null;
      }

      // --- CRITICAL FIX: Send Session Ready BEFORE generating audio ---
      // This ensures the frontend loader disappears before the voice starts.
      
      connection.isInitialized = true;
      connection.isInitializing = false;
      connection.isListening = true;

      // Send session ready
      this.send(socket, {
        type: WS_EVENTS.SERVER.SESSION_READY,
        data: {
          sessionId: socket.sessionId,
          status: 'ready',
          currentQuestion: connection.context
            ? conversationEngineService.getCurrentQuestionState(connection.context)
            : null,
        },
      });

      logger.info('[WS Gateway] Interview initialized - Ready signal sent', {
        sessionId: socket.sessionId,
        hasTranscriber: !!connection.transcriber,
        isListening: connection.isListening,
      });

      // Now generate opening if session is new
      if (previousResponses.length === 0 && (session.status === 'CREATED' || session.status === 'STARTED')) {
        await this.generateAndSpeakOpening(connection, session);
      }else {
        // RESUMING: Send current state
        this.sendSessionState(connection);
      }

      // Process any queued audio chunks
      if (connection.pendingAudioChunks.length > 0) {
        logger.info('[WS Gateway] Processing queued audio', {
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

    } catch (error) {
      connection.isInitializing = false;
      throw error;
    }
  }

  private async generateAndSpeakOpening(connection: ActiveConnection, session: any): Promise<void> {
    if (!connection.context) return;

    const { socket } = connection;

    // Check if opening already exists for this session
    const existingOpening = await prisma.aiInterviewResponse.findFirst({
      where: {
        sessionId: socket.sessionId,
        questionOrder: 0,
      },
    });

    if (existingOpening) {
      logger.info('[WS Gateway] Opening already exists, using existing', {
        sessionId: socket.sessionId,
        responseId: existingOpening.id,
      });

      connection.isAISpeaking = true;

      // Send existing opening text
      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_SPEAKING,
        data: { text: existingOpening.question, category: existingOpening.category },
      });

      // Stream TTS for existing opening
      try {
        for await (const audioChunk of textToSpeechService.streamSynthesize(existingOpening.question)) {
          if (!this.connections.has(socket.id)) return;
          this.send(socket, {
            type: WS_EVENTS.SERVER.AI_AUDIO,
            data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
          });
        }
      } catch (ttsError) {
        logger.warn('[WS Gateway] TTS failed for existing opening', ttsError);
      }

      this.send(socket, { type: WS_EVENTS.SERVER.AI_DONE, data: { questionId: existingOpening.id } });

      connection.isAISpeaking = false;
      return;
    }

    // Generate new opening
    logger.info('[WS Gateway] Generating new opening', { sessionId: socket.sessionId });

    connection.isAISpeaking = true;

    try {
      const opening = await conversationEngineService.generateOpening(connection.context);

      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_SPEAKING,
        data: { text: opening.question, category: opening.category },
      });

      // Stream TTS
      try {
        for await (const audioChunk of textToSpeechService.streamSynthesize(opening.question)) {
          if (!this.connections.has(socket.id)) return;
          this.send(socket, {
            type: WS_EVENTS.SERVER.AI_AUDIO,
            data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
          });
        }
      } catch (ttsError) {
        logger.warn('[WS Gateway] TTS failed for opening', ttsError);
      }

      this.send(socket, { type: WS_EVENTS.SERVER.AI_DONE, data: { questionId: opening.question } });

      // Update session status if needed
      if (session.status === 'CREATED') {
        await prisma.aiInterviewSession.update({
          where: { id: socket.sessionId },
          data: { status: 'STARTED', startedAt: new Date() },
        });
      }

      // Store opening question
      await prisma.aiInterviewResponse.create({
        data: {
          sessionId: socket.sessionId,
          category: opening.category,
          question: opening.question,
          answer: '',
          questionOrder: 0,
          isFollowup: false,
        },
      });

      logger.info('[WS Gateway] Opening generated and stored', {
        sessionId: socket.sessionId,
      });

    } finally {
      connection.isAISpeaking = false;
    }
  }

  // ===================================================
  // MESSAGE HANDLING
  // ===================================================

  private async handleMessage(connection: ActiveConnection, message: any): Promise<void> {
    const { socket } = connection;
    const { type, data } = message;

    connection.lastActivity = new Date();

    logger.debug('[WS Gateway] Message received', { type, sessionId: socket.sessionId });

    switch (type) {
      case WS_EVENTS.CLIENT.START_RECORDING:
        if (connection.isInitialized && !connection.isAISpeaking) {
          connection.isListening = true;
          connection.currentTranscript = '';
          logger.info('[WS Gateway] Recording started', { sessionId: socket.sessionId });
        } else {
          logger.warn('[WS Gateway] Cannot start recording', {
            isInitialized: connection.isInitialized,
            isAISpeaking: connection.isAISpeaking,
          });
        }
        break;

      case WS_EVENTS.CLIENT.STOP_RECORDING:
        connection.isListening = false;
        logger.info('[WS Gateway] Recording stopped', {
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
        } else {
          logger.warn('[WS Gateway] No transcript to process', { sessionId: socket.sessionId });
          // Wait a bit for late transcriptions
          setTimeout(async () => {
            if (connection.currentTranscript.trim().length > 0 && !connection.isAISpeaking) {
              logger.info('[WS Gateway] Late transcript arrived, processing', {
                transcript: connection.currentTranscript.substring(0, 50),
              });
              await this.processUserResponse(connection, connection.currentTranscript.trim());
              connection.currentTranscript = '';
            }
          }, 1500);
        }
        break;

      case WS_EVENTS.CLIENT.END_INTERVIEW:
        await this.endInterview(connection, data?.reason || 'completed');
        break;

      case WS_EVENTS.CLIENT.PAUSE:
        connection.isListening = false;
        break;

      case WS_EVENTS.CLIENT.RESUME:
        if (connection.isInitialized && !connection.isAISpeaking) {
          connection.isListening = true;
        }
        break;
      case 'ping':
      case WS_EVENTS.CLIENT.PING:
        socket.isAlive = true;
        socket.lastPongTime = Date.now();
        logger.debug('[WS Gateway] Application ping received, sending pong', {
          sessionId: socket.sessionId,
        });
        this.send(socket, { type: WS_EVENTS.SERVER.PONG });
        break;

      case WS_EVENTS.CLIENT.PONG:
      case 'pong':
        socket.isAlive = true;
        socket.lastPongTime = Date.now();
        break;

      default:
        logger.warn('[WS Gateway] Unknown message type', { type });
    }
  }

  private async handleAudioData(connection: ActiveConnection, audioBuffer: Buffer): Promise<void> {
    // Skip tiny buffers (likely just headers or noise)
    if (audioBuffer.length < 100) {
      return;
    }

    logger.debug('[WS Gateway] Audio data received', {
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
        logger.debug('[WS Gateway] Queueing audio - not initialized yet', {
          sessionId: connection.socket.sessionId,
          queueSize: connection.pendingAudioChunks.length,
        });
      }
      return;
    }

    if (!connection.isListening) {
      logger.debug('[WS Gateway] Ignoring audio - not listening', {
        sessionId: connection.socket.sessionId,
      });
      return;
    }

    if (connection.isAISpeaking) {
      logger.debug('[WS Gateway] Ignoring audio - AI is speaking', {
        sessionId: connection.socket.sessionId,
      });
      return;
    }

    if (connection.transcriber) {
      connection.transcriber.sendAudio(audioBuffer);
    } else {
      logger.warn('[WS Gateway] No transcriber available!', {
        sessionId: connection.socket.sessionId,
      });
    }
  }

  // ===================================================
  // TRANSCRIPTION HANDLING
  // ===================================================

  private handleTranscription(
    connection: ActiveConnection,
    result: { text: string; isFinal: boolean; confidence: number }
  ): void {
    const { socket } = connection;

    logger.info('[WS Gateway] Transcription received', {
      sessionId: socket.sessionId,
      text: result.text.substring(0, 100),
      isFinal: result.isFinal,
      confidence: result.confidence,
    });

    this.send(socket, {
      type: result.isFinal ? WS_EVENTS.SERVER.TRANSCRIPTION_FINAL : WS_EVENTS.SERVER.TRANSCRIPTION,
      data: { text: result.text, isFinal: result.isFinal, confidence: result.confidence },
    });

    if (result.isFinal && result.text.trim().length > 0) {
      connection.currentTranscript += ' ' + result.text;
      logger.debug('[WS Gateway] Updated transcript', {
        sessionId: socket.sessionId,
        currentTranscript: connection.currentTranscript.substring(0, 100),
        totalLength: connection.currentTranscript.length,
      });

      if (result.text.trim().length > 10) {
        this.scheduleResponseProcessing(connection);
      }
    }
  }

  private scheduleResponseProcessing(connection: ActiveConnection): void {
    const { socket } = connection;

    const existing = this.responseProcessingTimeout.get(socket.id);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(async () => {
      this.responseProcessingTimeout.delete(socket.id);

      if (connection.currentTranscript.trim().length > 10 && !connection.isAISpeaking) {
        logger.info('[WS Gateway] Auto-processing response after silence', {
          sessionId: socket.sessionId,
          transcriptLength: connection.currentTranscript.length,
        });
        await this.processUserResponse(connection, connection.currentTranscript.trim());
        connection.currentTranscript = '';
      }
    }, 5000); // 3 seconds of silence

    this.responseProcessingTimeout.set(socket.id, timeout);
  }

  private handleTranscriberError(connection: ActiveConnection, error: Error): void {
    logger.error('[WS Gateway] Transcriber error', {
      sessionId: connection.socket.sessionId,
      error: error.message,
    });
    this.sendError(connection.socket, 'TRANSCRIPTION_ERROR', 'Speech recognition error');
  }

  private handleTranscriberClose(connection: ActiveConnection): void {
    logger.info('[WS Gateway] Transcriber connection closed', {
      sessionId: connection.socket.sessionId,
    });

    if (this.connections.has(connection.socket.id) && connection.isListening && connection.isInitialized) {
      logger.info('[WS Gateway] Attempting to reconnect transcriber', {
        sessionId: connection.socket.sessionId,
      });
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
      logger.info('[WS Gateway] Transcriber reconnected', { sessionId: connection.socket.sessionId });
    } catch (error) {
      logger.error('[WS Gateway] Transcriber reconnection failed', error);
    }
  }

  // ===================================================
  // RESPONSE PROCESSING
  // ===================================================

  private async processUserResponse(connection: ActiveConnection, response: string): Promise<void> {
    if (!connection.context) {
      logger.error('[WS Gateway] No context for processing response', {
        sessionId: connection.socket.sessionId,
      });
      return;
    }

    const { socket } = connection;
    connection.isListening = false;
    connection.isAISpeaking = true;

    logger.info('[WS Gateway] Processing user response', {
      sessionId: socket.sessionId,
      responseLength: response.length,
      responsePreview: response.substring(0, 100),
    });

    try {
      this.send(socket, { type: WS_EVENTS.SERVER.AI_THINKING, data: { status: 'processing' } });

      // Get current question
      const currentResponse = await prisma.aiInterviewResponse.findFirst({
        where: { sessionId: socket.sessionId, answer: '' },
        orderBy: { questionOrder: 'desc' },
      });

      if (currentResponse) {
        logger.debug('[WS Gateway] Scoring response for question', {
          questionId: currentResponse.id,
          question: currentResponse.question.substring(0, 50),
        });

        const scores = await conversationEngineService.scoreResponse(
          currentResponse.question,
          response,
          currentResponse.category,
          connection.context
        );

        await prisma.aiInterviewResponse.update({
          where: { id: currentResponse.id },
          data: {
            answer: response,
            scoresJson: scores.scores as unknown as Prisma.InputJsonValue,
            feedbackText: scores.feedback,
            timeTakenSeconds: Math.round((Date.now() - connection.lastActivity.getTime()) / 1000),
          },
        });

        logger.info('[WS Gateway] Response scored', {
          sessionId: socket.sessionId,
          overallScore: scores.scores.overall,
        });
      }

      // Check if should end
      if (conversationEngineService.shouldEndInterview(connection.context)) {
        logger.info('[WS Gateway] Interview should end', { sessionId: socket.sessionId });
        await this.endInterview(connection, 'completed');
        return;
      }

      // Generate next question
      logger.debug('[WS Gateway] Generating next question', { sessionId: socket.sessionId });

      const nextQuestion = await conversationEngineService.generateNextQuestion(
        connection.context,
        response
      );

      const session = await prisma.aiInterviewSession.findUnique({
        where: { id: socket.sessionId },
      });

      const savedResponse = await prisma.aiInterviewResponse.create({
        data: {
          sessionId: socket.sessionId,
          category: nextQuestion.category,
          question: nextQuestion.question,
          answer: '',
          questionOrder: (session?.currentQuestionIndex || 0) + 1,
          isFollowup: nextQuestion.isFollowUp,
        },
      });

      await prisma.aiInterviewSession.update({
        where: { id: socket.sessionId },
        data: {
          status: 'IN_PROGRESS',
          currentQuestionIndex: { increment: 1 },
          questions: connection.context.questionsAsked as unknown as Prisma.InputJsonValue,
        },
      });

      logger.info('[WS Gateway] Next question generated', {
        sessionId: socket.sessionId,
        category: nextQuestion.category,
        isFollowUp: nextQuestion.isFollowUp,
        questionId: savedResponse.id
      });

      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_SPEAKING,
        data: {
          id: savedResponse.id,
          text: nextQuestion.question,
          category: nextQuestion.category,
          isFollowUp: nextQuestion.isFollowUp,
        },
      });

      // TTS
      try {
        for await (const audioChunk of textToSpeechService.streamSynthesize(nextQuestion.question)) {
          if (!this.connections.has(socket.id)) return;
          this.send(socket, {
            type: WS_EVENTS.SERVER.AI_AUDIO,
            data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
          });
        }
      } catch (ttsError) {
        logger.warn('[WS Gateway] TTS failed', ttsError);
      }

      this.send(socket, { type: WS_EVENTS.SERVER.AI_DONE, data: { questionId: savedResponse.id } });
      this.sendSessionState(connection);

    } catch (error) {
      logger.error('[WS Gateway] Response processing error', error);
      this.sendError(socket, 'PROCESSING_ERROR', 'Failed to process response');
    } finally {
      connection.isAISpeaking = false;
      connection.isListening = true;
      logger.debug('[WS Gateway] Ready for next response', {
        sessionId: socket.sessionId,
        isListening: connection.isListening,
      });
    }
  }

  // ===================================================
  // END INTERVIEW
  // ===================================================

  private async endInterview(connection: ActiveConnection, reason: string = 'completed'): Promise<void> {
    const { socket } = connection;
    connection.isListening = false;

    logger.info('[WS Gateway] Ending interview', { sessionId: socket.sessionId, reason });

    try {
      if (connection.transcriber) {
        await connection.transcriber.stop();
        connection.transcriber = null;
      }

      await prisma.aiInterviewSession.update({
        where: { id: socket.sessionId },
        data: {
          status: reason === 'cancelled' ? 'CANCELLED' : 'COMPLETED',
          completedAt: new Date(),
        },
      });

      const closingMessage = 'Thank you for completing this interview. Your feedback will be generated shortly.';

      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_SPEAKING,
        data: { text: closingMessage, category: 'CLOSING' },
      });

      try {
        for await (const audioChunk of textToSpeechService.streamSynthesize(closingMessage)) {
          this.send(socket, {
            type: WS_EVENTS.SERVER.AI_AUDIO,
            data: { chunk: audioChunk.toString('base64'), isLast: false, format: 'mp3' },
          });
        }
      } catch (ttsError) {
        logger.warn('[WS Gateway] TTS failed for closing', ttsError);
      }

      this.send(socket, { type: WS_EVENTS.SERVER.AI_DONE });

      this.send(socket, {
        type: WS_EVENTS.SERVER.INTERVIEW_ENDED,
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

    } catch (error) {
      logger.error('[WS Gateway] End interview error', error);
      this.sendError(socket, 'END_ERROR', 'Failed to end interview');
    }
  }

  // ===================================================
  // UTILITIES
  // ===================================================

  private sendSessionState(connection: ActiveConnection): void {
    if (!connection.context) return;

    const state: SessionState = {
      sessionId: connection.socket.sessionId,
      status: 'IN_PROGRESS',
      currentQuestion: conversationEngineService.getCurrentQuestionState(connection.context),
      isListening: connection.isListening,
      isAISpeaking: connection.isAISpeaking,
      progress: {
        totalQuestions: connection.context.config.targetQuestions,
        currentQuestionIndex: connection.context.questionsAsked.length,
        questionsAnswered: connection.context.questionsAsked.length - 1,
        estimatedTimeRemaining:
          (connection.context.config.targetQuestions - connection.context.questionsAsked.length) * 120,
        percentComplete: Math.round(
          (connection.context.questionsAsked.length / connection.context.config.targetQuestions) * 100
        ),
      },
    };

    this.send(connection.socket, { type: WS_EVENTS.SERVER.SESSION_STATE, data: state });
  }

  private send(socket: WebSocket, message: Partial<WSServerMessage>): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ ...message, timestamp: Date.now() }));
    }
  }

  private sendError(socket: WebSocket, code: string, message: string, recoverable = true): void {
    this.send(socket, { type: WS_EVENTS.SERVER.ERROR, data: { code, message, recoverable } });
  }

  private cleanupConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    logger.info('[WS Gateway] Cleaning up connection', { connectionId });

    if (connection.transcriber) {
      connection.transcriber.stop().catch(() => {});
    }

    const timeout = this.responseProcessingTimeout.get(connectionId);
    if (timeout) {
      clearTimeout(timeout);
      this.responseProcessingTimeout.delete(connectionId);
    }

    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.close(1000, 'Connection closed');
    }

    this.connections.delete(connectionId);
    logger.info('[WS Gateway] Connection cleaned up', { connectionId });
  }

  private startHeartbeat(): void {
    const interval = HEARTBEAT_CONFIG?.INTERVAL_MS || 30000;

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();

      for (const [id, connection] of this.connections) {
        const { socket } = connection;

        if (!socket.isAlive) {
          const timeSinceLastPong = now - socket.lastPongTime;

          if (timeSinceLastPong > interval * 2) {
            logger.info('[WS Gateway] Terminating inactive connection', {
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

        if (socket.readyState === WebSocket.OPEN) {
          socket.ping();
          this.send(socket, { type: WS_EVENTS.SERVER.PING });
        }

        // Check for idle timeout
        const idleTime = (now - connection.lastActivity.getTime()) / 1000;
        if (idleTime > INTERVIEW_SESSION_CONFIG.IDLE_TIMEOUT_SECONDS) {
          logger.info('[WS Gateway] Terminating idle connection', {
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

  private createMinimalResume(): ParsedResume {
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
  shutdown(): void {
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

    logger.info('[WS Gateway] WebSocket server shut down');
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const interviewGateway = new InterviewWebSocketGateway();
export { InterviewWebSocketGateway };