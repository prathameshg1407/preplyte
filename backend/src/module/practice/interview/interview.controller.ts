// interview.controller.ts

import { Response, NextFunction } from 'express';
import { InterviewService } from './interview.service';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import {
  parseRequest,
  startSessionSchema,
  submitResponseSchema,
  sessionIdParamSchema,
  getSessionsQuerySchema,
} from './interview.validation';
import { UnauthorizedError } from '../../../utils/errors';

export class InterviewController {
  constructor(private readonly service: InterviewService) {
    this.startSession = this.startSession.bind(this);
    this.submitResponse = this.submitResponse.bind(this);
    this.getSession = this.getSession.bind(this);
    this.endSession = this.endSession.bind(this);
    this.getFeedback = this.getFeedback.bind(this);
    this.getSessions = this.getSessions.bind(this);
    this.getStats = this.getStats.bind(this);
    this.deleteSession = this.deleteSession.bind(this);
  }

  async startSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const dto = parseRequest(startSessionSchema, req.body);
      const result = await this.service.startSession(userId, dto);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Interview session started',
      });
    } catch (error) {
      next(error);
    }
  }

  async submitResponse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);
      const dto = parseRequest(submitResponseSchema, req.body);
      const result = await this.service.submitResponse(sessionId, userId, dto);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);
      const result = await this.service.getSession(sessionId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async endSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);
      const result = await this.service.endSession(sessionId, userId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Interview completed',
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);
      const result = await this.service.getFeedback(sessionId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const { page, limit } = parseRequest(getSessionsQuerySchema, req.query);
      const result = await this.service.getUserSessions(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const result = await this.service.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.requireUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);
      await this.service.deleteSession(sessionId, userId);

      res.status(200).json({
        success: true,
        message: 'Session deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  private requireUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }
    return userId;
  }
}