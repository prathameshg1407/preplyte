// backend/src/module/event/hackathon/registration/registration.controller.ts

import { Request, Response, NextFunction } from 'express';
import { registrationService } from './registration.service';
import { sendSuccess } from '../../../../utils/response';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';

export class RegistrationController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const registration = await registrationService.register(req.body, authReq.user!.id);
      return sendSuccess(res, registration, 'Registered successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const hackathonId = req.params.id as string;
      const registration = await registrationService.getRegistration(hackathonId, authReq.user!.id);
      return sendSuccess(res, registration, 'Registration status retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const hackathonId = req.params.id as string;
      const registrations = await registrationService.listRegistrations(hackathonId);
      return sendSuccess(res, registrations, 'Registrations retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const registrationController = new RegistrationController();
