// src/module/practice/interview/websocket/interview.gateway.ts

import { WebSocket, WebSocketServer } from 'ws';
import type { RawData } from 'ws';
import { Server } from 'http';
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
import { WS_EVENTS, INTERVIEW_SESSION_CONFIG } from '../interview.constants';

// =====================================================
// TYPES
// =====================================================

interface AuthenticatedSocket extends WebSocket {
  id: string;
  userId: string;
  sessionId: string;
  isAlive: boolean;
}

interface ActiveConnection {
  socket: AuthenticatedSocket;
  transcriber: RealtimeTranscriber | null;
  context: ConversationContext | null;
  isListening: boolean;
  isAISpeaking: boolean;
  currentTranscript: string;
  lastActivity: Date;
}

interface JWTPayload {
  id: string;
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

  // Cache the secret as Uint8Array for jose
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
    this.wss = new WebSocketServer({
      server,
      path: '/ws/interview',
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();

    logger.info('[WS Gateway] WebSocket server initialized');
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const [id] of this.connections) {
      this.cleanupConnection(id);
    }

    if (this.wss) {
      this.wss.close();
    }

    logger.info('[WS Gateway] WebSocket server shut down');
  }

  // ===================================================
  // CONNECTION HANDLING
  // ===================================================

  private async handleConnection(
    socket: WebSocket,
    request: any
  ): Promise<void> {
    const connectionId = nanoid();
    logger.info('[WS Gateway] New connection', { connectionId });

    try {
      // Extract session ID from URL
      const url = new URL(request.url, `http://${request.headers.host}`);
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 1];

      if (!sessionId) {
        this.sendError(socket, 'INVALID_SESSION', 'Session ID required');
        socket.close(4000);
        return;
      }

      // Authenticate
      const token = url.searchParams.get('token');
      const userId = await this.authenticateSocket(token);

      if (!userId) {
        this.sendError(socket, 'UNAUTHORIZED', 'Authentication required');
        socket.close(4001);
        return;
      }

      // Verify session ownership
      const session = await prisma.aiInterviewSession.findFirst({
        where: { id: sessionId, userId },
        include: { resume: true },
      });

      if (!session) {
        this.sendError(socket, 'SESSION_NOT_FOUND', 'Session not found');
        socket.close(4004);
        return;
      }

      if (!['CREATED', 'STARTED', 'IN_PROGRESS'].includes(session.status)) {
        this.sendError(socket, 'SESSION_INVALID', 'Session is not active');
        socket.close(4003);
        return;
      }

      // Setup authenticated socket
      const authSocket = socket as AuthenticatedSocket;
      authSocket.id = connectionId;
      authSocket.userId = userId;
      authSocket.sessionId = sessionId;
      authSocket.isAlive = true;

      // Initialize connection state
      const connection: ActiveConnection = {
        socket: authSocket,
        transcriber: null,
        context: null,
        isListening: false,
        isAISpeaking: false,
        currentTranscript: '',
        lastActivity: new Date(),
      };

      this.connections.set(connectionId, connection);

      // Setup event handlers
      this.setupSocketHandlers(authSocket, connection);

      // Initialize the interview
      await this.initializeInterview(connection, session);

      // Send connected confirmation
      this.send(authSocket, {
        type: WS_EVENTS.SERVER.CONNECTED,
        data: {
          connectionId,
          sessionId,
          status: session.status,
        },
      });
    } catch (error) {
      logger.error('[WS Gateway] Connection error', error);
      this.sendError(socket, 'CONNECTION_ERROR', 'Failed to establish connection');
      socket.close(4500);
    }
  }

  private setupSocketHandlers(
    socket: AuthenticatedSocket,
    connection: ActiveConnection
  ): void {
    socket.on('message', async (data: RawData) => {
      connection.lastActivity = new Date();

      try {
        // Check if it's binary data (audio)
        if (this.isBinaryData(data)) {
          const buffer = this.toBuffer(data);
          await this.handleAudioData(connection, buffer);
        } else {
          // JSON message
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
    });

    socket.on('close', () => {
      logger.info('[WS Gateway] Connection closed', { id: socket.id });
      this.cleanupConnection(socket.id);
    });

    socket.on('error', (error) => {
      logger.error('[WS Gateway] Socket error', { id: socket.id, error });
      this.cleanupConnection(socket.id);
    });
  }

  /**
   * Check if the data is binary (audio data)
   */
  private isBinaryData(data: RawData): boolean {
    return (
      Buffer.isBuffer(data) ||
      data instanceof ArrayBuffer ||
      ArrayBuffer.isView(data)
    );
  }

  /**
   * Convert RawData to Buffer safely
   */
  private toBuffer(data: RawData): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return Buffer.from(new Uint8Array(data));
    }
    if (ArrayBuffer.isView(data)) {
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }
    // Handle Buffer[] (fragmented messages)
    if (Array.isArray(data)) {
      return Buffer.concat(data);
    }
    throw new Error('Unsupported data type');
  }

  // ===================================================
  // INTERVIEW INITIALIZATION
  // ===================================================

  private async initializeInterview(
    connection: ActiveConnection,
    session: any
  ): Promise<void> {
    const { socket } = connection;

    try {
      // Parse resume if available
      let parsedResume: ParsedResume | null = null;
      if (session.resumeId) {
        parsedResume = await resumeParserService.parseResumeById(
          socket.userId,
          session.resumeId
        );
      }

      // Initialize conversation context
      connection.context = await conversationEngineService.initializeContext(
        parsedResume || this.createMinimalResume(),
        {
          jobTitle: session.jobTitle || 'Software Engineer',
          companyName: session.companyName,
          difficulty: session.difficulty,
          focusAreas: session.focusAreas,
          targetQuestions: session.totalQuestions,
        }
      );

      // Initialize speech-to-text
      connection.transcriber = speechToTextService.createRealtimeTranscriber({
        onTranscript: (result) => this.handleTranscription(connection, result),
        onError: (error) => this.handleTranscriberError(connection, error),
        onClose: () => this.handleTranscriberClose(connection),
      });

      await connection.transcriber.start();

      // If session just created, generate opening
      if (session.status === 'CREATED' || session.status === 'STARTED') {
        await this.generateAndSpeakOpening(connection, session);
      }

      // Send session ready
      this.send(socket, {
        type: WS_EVENTS.SERVER.SESSION_READY,
        data: {
          sessionId: socket.sessionId,
          status: 'ready',
          currentQuestion: conversationEngineService.getCurrentQuestionState(
            connection.context
          ),
        },
      });

      connection.isListening = true;
    } catch (error) {
      logger.error('[WS Gateway] Interview initialization failed', error);
      this.sendError(socket, 'INIT_ERROR', 'Failed to initialize interview');
    }
  }

  private async generateAndSpeakOpening(
    connection: ActiveConnection,
    session: any
  ): Promise<void> {
    if (!connection.context) return;

    const { socket } = connection;
    connection.isAISpeaking = true;

    // Generate opening
    const opening = await conversationEngineService.generateOpening(connection.context);

    // Send text first
    this.send(socket, {
      type: WS_EVENTS.SERVER.AI_SPEAKING,
      data: {
        text: opening.question,
        category: opening.category,
      },
    });

    // Stream TTS audio
    for await (const audioChunk of textToSpeechService.streamSynthesize(
      opening.question
    )) {
      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_AUDIO,
        data: {
          chunk: audioChunk.toString('base64'),
          isLast: false,
          format: 'mp3',
        },
      });
    }

    // Send completion
    this.send(socket, {
      type: WS_EVENTS.SERVER.AI_DONE,
      data: { questionId: opening.question },
    });

    // Update session
    await prisma.aiInterviewSession.update({
      where: { id: socket.sessionId },
      data: {
        status: 'STARTED',
        startedAt: new Date(),
      },
    });

    // Store the opening question
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

    connection.isAISpeaking = false;
    connection.isListening = true;
  }

  // ===================================================
  // MESSAGE HANDLING
  // ===================================================

  private async handleMessage(
    connection: ActiveConnection,
    message: any
  ): Promise<void> {
    const { socket } = connection;
    const { type } = message;

    switch (type) {
      case WS_EVENTS.CLIENT.START_RECORDING:
        connection.isListening = true;
        connection.currentTranscript = '';
        break;

      case WS_EVENTS.CLIENT.STOP_RECORDING:
        connection.isListening = false;
        if (connection.currentTranscript.trim().length > 0) {
          await this.processUserResponse(connection, connection.currentTranscript);
        }
        break;

      case WS_EVENTS.CLIENT.END_INTERVIEW:
        await this.endInterview(connection, message.reason);
        break;

      case WS_EVENTS.CLIENT.PAUSE:
        connection.isListening = false;
        break;

      case WS_EVENTS.CLIENT.RESUME:
        connection.isListening = true;
        break;

      case WS_EVENTS.CLIENT.PING:
        this.send(socket, { type: WS_EVENTS.SERVER.PONG });
        break;

      default:
        logger.warn('[WS Gateway] Unknown message type', { type });
    }
  }

  private async handleAudioData(
    connection: ActiveConnection,
    audioBuffer: Buffer
  ): Promise<void> {
    if (!connection.isListening || connection.isAISpeaking) {
      return;
    }

    if (connection.transcriber) {
      connection.transcriber.sendAudio(audioBuffer);
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

    // Send interim transcription
    this.send(socket, {
      type: result.isFinal
        ? WS_EVENTS.SERVER.TRANSCRIPTION_FINAL
        : WS_EVENTS.SERVER.TRANSCRIPTION,
      data: {
        text: result.text,
        isFinal: result.isFinal,
        confidence: result.confidence,
      },
    });

    if (result.isFinal) {
      connection.currentTranscript += ' ' + result.text;

      // Check if response is complete (pause detected)
      if (result.text.length > 10) {
        // Auto-process after a complete thought
        this.scheduleResponseProcessing(connection);
      }
    }
  }

  private scheduleResponseProcessing(connection: ActiveConnection): void {
    const { socket } = connection;

    // Clear existing timeout
    const existing = this.responseProcessingTimeout.get(socket.id);
    if (existing) {
      clearTimeout(existing);
    }

    // Schedule processing after silence
    const timeout = setTimeout(async () => {
      if (
        connection.currentTranscript.trim().length > 10 &&
        !connection.isAISpeaking
      ) {
        await this.processUserResponse(connection, connection.currentTranscript.trim());
        connection.currentTranscript = '';
      }
    }, 2000); // 2 second silence = end of response

    this.responseProcessingTimeout.set(socket.id, timeout);
  }

  // ===================================================
  // RESPONSE PROCESSING
  // ===================================================

  private async processUserResponse(
    connection: ActiveConnection,
    response: string
  ): Promise<void> {
    if (!connection.context) return;

    const { socket } = connection;
    connection.isListening = false;
    connection.isAISpeaking = true;

    try {
      // Notify AI is thinking
      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_THINKING,
        data: { status: 'processing' },
      });

      // Get current question from DB
      const currentResponse = await prisma.aiInterviewResponse.findFirst({
        where: {
          sessionId: socket.sessionId,
          answer: '',
        },
        orderBy: { questionOrder: 'desc' },
      });

      if (currentResponse) {
        // Score the response
        const scores = await conversationEngineService.scoreResponse(
          currentResponse.question,
          response,
          currentResponse.category,
          connection.context
        );

        // Update the response in DB
        // Cast scores to Prisma-compatible JSON type
        await prisma.aiInterviewResponse.update({
          where: { id: currentResponse.id },
          data: {
            answer: response,
            scoresJson: scores.scores as unknown as Prisma.InputJsonValue,
            feedbackText: scores.feedback,
            timeTakenSeconds: Math.round(
              (Date.now() - connection.lastActivity.getTime()) / 1000
            ),
          },
        });
      }

      // Check if interview should end
      if (conversationEngineService.shouldEndInterview(connection.context)) {
        await this.endInterview(connection, 'completed');
        return;
      }

      // Generate next question
      const nextQuestion = await conversationEngineService.generateNextQuestion(
        connection.context,
        response
      );

      // Store next question
      const session = await prisma.aiInterviewSession.findUnique({
        where: { id: socket.sessionId },
      });

      await prisma.aiInterviewResponse.create({
        data: {
          sessionId: socket.sessionId,
          category: nextQuestion.category,
          question: nextQuestion.question,
          answer: '',
          questionOrder: (session?.currentQuestionIndex || 0) + 1,
          isFollowup: nextQuestion.isFollowUp,
        },
      });

      // Update session progress
      // Cast questions array to Prisma-compatible JSON type
      await prisma.aiInterviewSession.update({
        where: { id: socket.sessionId },
        data: {
          status: 'IN_PROGRESS',
          currentQuestionIndex: { increment: 1 },
          questions: connection.context.questionsAsked as unknown as Prisma.InputJsonValue,
        },
      });

      // Send question text
      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_SPEAKING,
        data: {
          text: nextQuestion.question,
          category: nextQuestion.category,
          isFollowUp: nextQuestion.isFollowUp,
        },
      });

      // Stream TTS audio
      for await (const audioChunk of textToSpeechService.streamSynthesize(
        nextQuestion.question
      )) {
        if (!this.connections.has(socket.id)) {
          // Connection closed during streaming
          return;
        }

        this.send(socket, {
          type: WS_EVENTS.SERVER.AI_AUDIO,
          data: {
            chunk: audioChunk.toString('base64'),
            isLast: false,
            format: 'mp3',
          },
        });
      }

      // Send completion
      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_DONE,
        data: {
          questionId: nextQuestion.question,
        },
      });

      // Send updated session state
      this.sendSessionState(connection);

      connection.isAISpeaking = false;
      connection.isListening = true;
    } catch (error) {
      logger.error('[WS Gateway] Response processing error', error);
      this.sendError(socket, 'PROCESSING_ERROR', 'Failed to process response');
      connection.isAISpeaking = false;
      connection.isListening = true;
    }
  }

  // ===================================================
  // INTERVIEW END
  // ===================================================

  private async endInterview(
    connection: ActiveConnection,
    reason: string = 'completed'
  ): Promise<void> {
    const { socket } = connection;
    connection.isListening = false;

    try {
      // Stop transcriber
      if (connection.transcriber) {
        await connection.transcriber.stop();
        connection.transcriber = null;
      }

      // Update session status
      await prisma.aiInterviewSession.update({
        where: { id: socket.sessionId },
        data: {
          status: reason === 'cancelled' ? 'CANCELLED' : 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Notify client
      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_SPEAKING,
        data: {
          text: 'Thank you for completing this interview. Your feedback will be generated shortly.',
          category: 'CLOSING',
        },
      });

      // Generate closing audio
      const closingMessage =
        'Thank you for completing this interview. Your feedback will be generated shortly.';

      for await (const audioChunk of textToSpeechService.streamSynthesize(
        closingMessage
      )) {
        this.send(socket, {
          type: WS_EVENTS.SERVER.AI_AUDIO,
          data: {
            chunk: audioChunk.toString('base64'),
            isLast: false,
            format: 'mp3',
          },
        });
      }

      this.send(socket, {
        type: WS_EVENTS.SERVER.AI_DONE,
      });

      // Send interview ended
      this.send(socket, {
        type: WS_EVENTS.SERVER.INTERVIEW_ENDED,
        data: {
          sessionId: socket.sessionId,
          reason,
          feedbackUrl: `/api/practice/interview/sessions/${socket.sessionId}/feedback`,
        },
      });

      // Cleanup
      this.cleanupConnection(socket.id);
    } catch (error) {
      logger.error('[WS Gateway] End interview error', error);
      this.sendError(socket, 'END_ERROR', 'Failed to end interview');
    }
  }

  // ===================================================
  // TRANSCRIBER EVENTS
  // ===================================================

  private handleTranscriberError(connection: ActiveConnection, error: Error): void {
    logger.error('[WS Gateway] Transcriber error', error);
    this.sendError(
      connection.socket,
      'TRANSCRIPTION_ERROR',
      'Speech recognition error'
    );
  }

  private handleTranscriberClose(connection: ActiveConnection): void {
    logger.debug('[WS Gateway] Transcriber closed', {
      id: connection.socket.id,
    });

    // Attempt to reconnect if connection is still active
    if (this.connections.has(connection.socket.id) && connection.isListening) {
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
      logger.info('[WS Gateway] Transcriber reconnected', {
        id: connection.socket.id,
      });
    } catch (error) {
      logger.error('[WS Gateway] Transcriber reconnection failed', error);
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
      currentQuestion: conversationEngineService.getCurrentQuestionState(
        connection.context
      ),
      isListening: connection.isListening,
      isAISpeaking: connection.isAISpeaking,
      progress: {
        totalQuestions: connection.context.config.targetQuestions,
        currentQuestionIndex: connection.context.questionsAsked.length,
        questionsAnswered: connection.context.questionsAsked.length - 1,
        estimatedTimeRemaining:
          (connection.context.config.targetQuestions -
            connection.context.questionsAsked.length) *
          120,
        percentComplete: Math.round(
          (connection.context.questionsAsked.length /
            connection.context.config.targetQuestions) *
            100
        ),
      },
    };

    this.send(connection.socket, {
      type: WS_EVENTS.SERVER.SESSION_STATE,
      data: state,
    });
  }

  private send(socket: WebSocket, message: Partial<WSServerMessage>): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          ...message,
          timestamp: Date.now(),
        })
      );
    }
  }

  private sendError(
    socket: WebSocket,
    code: string,
    message: string,
    recoverable: boolean = true
  ): void {
    this.send(socket, {
      type: WS_EVENTS.SERVER.ERROR,
      data: {
        code,
        message,
        recoverable,
      },
    });
  }

  /**
   * Authenticate socket using jose for JWT verification
   */
  private async authenticateSocket(token: string | null): Promise<string | null> {
    if (!token) return null;

    try {
      const secret = this.getJwtSecret();

      const { payload } = await jwtVerify(token, secret, {
        // Optional: Add additional verification options
        // issuer: 'your-app-name',
        // audience: 'your-app-audience',
      });

      // Type assertion with validation
      const jwtPayload = payload as JWTPayload;

      if (typeof jwtPayload.id !== 'string') {
        logger.warn('[WS Gateway] Invalid token payload - missing id');
        return null;
      }

      return jwtPayload.id;
    } catch (error) {
      // jose throws specific error types you can handle
      if (error instanceof Error) {
        if (error.name === 'JWTExpired') {
          logger.warn('[WS Gateway] Token expired');
        } else if (error.name === 'JWTClaimValidationFailed') {
          logger.warn('[WS Gateway] Token claim validation failed');
        } else {
          logger.warn('[WS Gateway] Token verification failed', {
            error: error.message,
            name: error.name,
          });
        }
      }
      return null;
    }
  }

  private cleanupConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Stop transcriber
    if (connection.transcriber) {
      connection.transcriber.stop().catch((err) => {
        logger.warn('[WS Gateway] Error stopping transcriber', err);
      });
    }

    // Clear timeout
    const timeout = this.responseProcessingTimeout.get(connectionId);
    if (timeout) {
      clearTimeout(timeout);
      this.responseProcessingTimeout.delete(connectionId);
    }

    // Close socket if still open
    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.close();
    }

    this.connections.delete(connectionId);
    logger.info('[WS Gateway] Connection cleaned up', { connectionId });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [id, connection] of this.connections) {
        if (!connection.socket.isAlive) {
          logger.info('[WS Gateway] Terminating inactive connection', { id });
          this.cleanupConnection(id);
          continue;
        }

        connection.socket.isAlive = false;
        connection.socket.ping();

        // Check for idle timeout
        const idleTime =
          (Date.now() - connection.lastActivity.getTime()) / 1000;
        if (idleTime > INTERVIEW_SESSION_CONFIG.IDLE_TIMEOUT_SECONDS) {
          logger.info('[WS Gateway] Terminating idle connection', { id });
          this.sendError(
            connection.socket,
            'IDLE_TIMEOUT',
            'Session terminated due to inactivity',
            false
          );
          this.cleanupConnection(id);
        }
      }
    }, 30000); // Every 30 seconds
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
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const interviewGateway = new InterviewWebSocketGateway();
export { InterviewWebSocketGateway };