// src/module/mock-drive/discovery/discovery.controller.ts

import { Response, NextFunction } from 'express';
import { DiscoveryService } from './discovery.service';
import { DiscoveryListInput, MockDriveIdInput } from './discovery.validation';
import { sendSuccess } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export class DiscoveryController {
  constructor(private service: DiscoveryService) {}

  listAvailableDrives = async (
    req: AuthenticatedRequest & { query: DiscoveryListInput['query'] },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { page, limit, status, instituteId, search, registrationOpen } = req.query;

      const result = await this.service.listAvailableDrives(
        userId,
        {
          page,
          limit,
          filters: { status, instituteId, search, registrationOpen },
        },
        userRole
      );

      sendSuccess(res, result, 'Mock drives retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getDriveDetails = async (
    req: AuthenticatedRequest & { params: MockDriveIdInput['params'] },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { driveId } = req.params;

      const result = await this.service.getDriveDetails(userId, driveId, userRole);

      sendSuccess(res, result, 'Mock drive details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  checkEligibility = async (
    req: AuthenticatedRequest & { params: MockDriveIdInput['params'] },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { driveId } = req.params;

      const result = await this.service.checkEligibility(userId, driveId, userRole);

      sendSuccess(res, result, 'Eligibility check completed');
    } catch (error) {
      next(error);
    }
  };

  register = async (
    req: AuthenticatedRequest & { params: MockDriveIdInput['params'] },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { driveId } = req.params;

      const result = await this.service.register(userId, driveId, userRole);

      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  };

  withdrawRegistration = async (
    req: AuthenticatedRequest & { params: MockDriveIdInput['params'] },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { driveId } = req.params;

      await this.service.withdrawRegistration(userId, driveId, userRole);

      sendSuccess(res, null, 'Registration withdrawn successfully');
    } catch (error) {
      next(error);
    }
  };

  getMyRegistrations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;

      const result = await this.service.getMyRegistrations(userId);

      sendSuccess(res, result, 'Registrations retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}