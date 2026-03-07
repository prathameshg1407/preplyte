// backend/src/module/event/hackathon/team/team.controller.ts

import { Request, Response, NextFunction } from 'express';
import { teamService } from './team.service';
import { sendSuccess } from '../../../../utils/response';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';

export class TeamController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const team = await teamService.createTeam(req.body, authReq.user!.id);
      return sendSuccess(res, team, 'Team created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const team = await teamService.joinTeam(req.body, authReq.user!.id);
      return sendSuccess(res, team, 'Joined team successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const team = await teamService.getTeamDetails(id);
      return sendSuccess(res, team, 'Team details retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const teamController = new TeamController();
