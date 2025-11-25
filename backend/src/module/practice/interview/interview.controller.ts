// src/modules/interview/interview.controller.ts

import { Request, Response, NextFunction } from 'express';
import { InterviewService } from './interview.service';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import {
  startInterviewSchema,
  submitAnswerSchema,
  sessionIdParamSchema,
  parseRequest,
} from './interview.validation';
import { HTTP_STATUS } from '../../../config/constants';
import { BadRequestError } from '../../../lib/errors';

export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {
    // Bind all methods
    this.startInterviewSession = this.startInterviewSession.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.getInterviewFeedback = this.getInterviewFeedback.bind(this);
    this.getInterviewSession = this.getInterviewSession.bind(this);
    this.getNextQuestion = this.getNextQuestion.bind(this);
    this.getUserSessions = this.getUserSessions.bind(this);
    this.getUserSessionStats = this.getUserSessionStats.bind(this);
    this.cancelSession = this.cancelSession.bind(this);
    this.deleteSession = this.deleteSession.bind(this);
    this.testTTS = this.testTTS.bind(this);
  }

  async startInterviewSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const dto = parseRequest(startInterviewSchema, req.body);

      const result = await this.interviewService.startInterviewSession(userId, dto);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: result,
        message: 'Interview session started successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);
      const dto = parseRequest(submitAnswerSchema, req.body);

      const result = await this.interviewService.submitAnswer(sessionId, userId, dto);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);

      const result = await this.interviewService.getInterviewFeedback(sessionId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);

      const result = await this.interviewService.getInterviewSession(sessionId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNextQuestion(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);

      const result = await this.interviewService.getNextQuestion(sessionId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSessions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);

      const result = await this.interviewService.getUserSessions(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSessionStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);

      const result = await this.interviewService.getUserSessionStats(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);

      await this.interviewService.cancelSession(sessionId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Session cancelled successfully',
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
      const userId = this.getUserId(req);
      const { sessionId } = parseRequest(sessionIdParamSchema, req.params);

      await this.interviewService.deleteSession(sessionId, userId);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async testTTS(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.interviewService.testTTS();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user?.id) {
      throw new BadRequestError('User ID not found in request');
    }
    return req.user.id;
  }
}