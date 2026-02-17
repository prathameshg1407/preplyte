// src/module/mock-drive/attempt/attempt.controller.ts

import { Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { AttemptService } from './attempt.service';
import {
  MockDriveIdInput,
  ModuleIdInput,
  AptitudeAnswerInput,
  AptitudeClearInput,
  AptitudeMarkReviewInput,
  MachineSubmitInput,
  MachineRunInput,
  InterviewRespondInput,
  InterviewSkipInput,
} from './attempt.validation';
import { sendSuccess } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

// ============================================
// Request Type Helper
// ============================================

type TypedRequest<
  P extends ParamsDictionary = ParamsDictionary,
  B = unknown,
> = AuthenticatedRequest & {
  params: P;
  body: B;
};

// ============================================
// Controller
// ============================================

export class AttemptController {
  constructor(private readonly service: AttemptService) { }

  // ============================================
  // Attempt Lifecycle
  // ============================================

  getAttemptState = async (
    req: TypedRequest<MockDriveIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;

      const result = await this.service.getAttemptState(userId, driveId);

      if (result) {
        sendSuccess(res, result, 'Attempt state retrieved successfully');
      } else {
        sendSuccess(res, null, 'No attempt found for this mock drive');
      }
    } catch (error) {
      next(error);
    }
  };

  startAttempt = async (
    req: TypedRequest<MockDriveIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;

      const result = await this.service.startAttempt(userId, driveId);

      sendSuccess(res, result, 'Attempt started successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  submitAttempt = async (
    req: TypedRequest<MockDriveIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;

      await this.service.submitAttempt(userId, driveId);

      sendSuccess(res, null, 'Attempt submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Module Lifecycle
  // ============================================

  startModule = async (
    req: TypedRequest<ModuleIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.startModule(userId, driveId, moduleId);

      sendSuccess(res, result, 'Module started successfully');
    } catch (error) {
      next(error);
    }
  };

  submitModule = async (
    req: TypedRequest<ModuleIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.submitModule(userId, driveId, moduleId, false);

      sendSuccess(res, result, 'Module submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  getModuleState = async (
    req: TypedRequest<ModuleIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.getModuleState(userId, driveId, moduleId);

      sendSuccess(res, result, 'Module state retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Aptitude Module Actions
  // ============================================

  submitAptitudeAnswer = async (
    req: TypedRequest<AptitudeAnswerInput['params'], AptitudeAnswerInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'answer',
        req.body
      );

      sendSuccess(res, result, 'Answer submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  clearAptitudeAnswer = async (
    req: TypedRequest<AptitudeClearInput['params'], AptitudeClearInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'clear',
        req.body
      );

      sendSuccess(res, result, 'Answer cleared successfully');
    } catch (error) {
      next(error);
    }
  };

  markForReview = async (
    req: TypedRequest<AptitudeMarkReviewInput['params'], AptitudeMarkReviewInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'mark_review',
        req.body
      );

      sendSuccess(res, result, 'Review status updated');
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Machine Coding Module Actions
  // ============================================

  submitMachineCode = async (
    req: TypedRequest<MachineSubmitInput['params'], MachineSubmitInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'submit',
        req.body
      );

      sendSuccess(res, result, 'Code submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  runMachineCode = async (
    req: TypedRequest<MachineRunInput['params'], MachineRunInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'run',
        req.body
      );

      sendSuccess(res, result, 'Code executed successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // AI Interview Module Actions
  // ============================================

  submitInterviewResponse = async (
    req: TypedRequest<InterviewRespondInput['params'], InterviewRespondInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'respond',
        req.body
      );

      sendSuccess(res, result, 'Response submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  skipInterviewQuestion = async (
    req: TypedRequest<InterviewSkipInput['params'], InterviewSkipInput['body']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'skip',
        req.body
      );

      sendSuccess(res, result, 'Question skipped');
    } catch (error) {
      next(error);
    }
  };

  getNextInterviewQuestion = async (
    req: TypedRequest<ModuleIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'next_question',
        {}
      );

      sendSuccess(res, result, 'Next question retrieved');
    } catch (error) {
      next(error);
    }
  };

  startVoiceMode = async (
    req: TypedRequest<ModuleIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'start_voice',
        {}
      );

      sendSuccess(res, result, 'Voice mode enabled');
    } catch (error) {
      next(error);
    }
  };

  getAudioQuestion = async (
    req: TypedRequest<ModuleIdInput['params']>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { driveId, moduleId } = req.params;

      const result = await this.service.handleModuleAction(
        userId,
        driveId,
        moduleId,
        'get_audio_question',
        {}
      );

      sendSuccess(res, result, 'Audio question generated');
    } catch (error) {
      next(error);
    }
  };
}