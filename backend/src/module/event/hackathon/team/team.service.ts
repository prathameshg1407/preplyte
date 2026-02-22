// backend/src/module/event/hackathon/team/team.service.ts

import { prisma } from '../../../../lib/db';
import { TeamStatus, TeamMemberRole, ParticipationType } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
} from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';
import { CreateTeamInput, JoinTeamInput } from '../hackathon.types';
import { generateInviteCode } from '../../shared/event.utils';
import { EVENT_LIMITS } from '../../event.constants';

export class TeamService {
  /**
   * Create a new team
   */
  async createTeam(input: CreateTeamInput, userId: string) {
    logger.info('[TeamService] Creating team', { teamName: input.teamName, userId });

    // 1. Check registration
    const registration = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: input.hackathonId, userId } },
      include: { hackathon: true }
    });

    if (!registration) throw new BadRequestError('You must register for the hackathon first');
    if (registration.teamId) throw new BadRequestError('You are already in a team');
    
    const hackathon = registration.hackathon;
    if (hackathon.participationType === ParticipationType.INDIVIDUAL) {
      throw new BadRequestError('This hackathon only allows individual participation');
    }

    // 2. Create team
    return await prisma.$transaction(async (tx) => {
      const team = await tx.hackathonTeam.create({
        data: {
          hackathonId: input.hackathonId,
          name: input.teamName,
          inviteCode: generateInviteCode(EVENT_LIMITS.INVITE_CODE_LENGTH),
          status: TeamStatus.FORMING,
          currentSize: 1,
          leaderId: userId
        }
      });

      // Add creator as LEADER
      await tx.hackathonTeamMember.create({
        data: {
          teamId: team.id,
          userId: userId,
          role: TeamMemberRole.LEADER
        }
      });

      // Update registration
      await tx.hackathonRegistration.update({
        where: { id: registration.id },
        data: { teamId: team.id }
      });

      // Update hackathon counters
      await tx.hackathon.update({
        where: { id: input.hackathonId },
        data: { teamCount: { increment: 1 } }
      });

      return team;
    });
  }

  /**
   * Join a team using invite code
   */
  async joinTeam(input: JoinTeamInput, userId: string) {
    logger.info('[TeamService] Joining team', { inviteCode: input.inviteCode, userId });

    // 1. Find team
    const team = await prisma.hackathonTeam.findUnique({
      where: { inviteCode: input.inviteCode },
      include: { hackathon: true }
    });

    if (!team || team.hackathonId !== input.hackathonId) {
      throw new BadRequestError('Invalid invite code');
    }

    if (team.status !== TeamStatus.FORMING) {
      throw new BadRequestError('Team is no longer accepting members');
    }

    if (team.currentSize >= team.hackathon.maxTeamSize) {
      throw new BadRequestError('Team is already full');
    }

    // 2. Check registration
    const registration = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: input.hackathonId, userId } }
    });

    if (!registration) throw new BadRequestError('You must register for the hackathon first');
    if (registration.teamId) throw new BadRequestError('You are already in a team');

    // 3. Join team
    return await prisma.$transaction(async (tx) => {
      // Add member
      await tx.hackathonTeamMember.create({
        data: {
          teamId: team.id,
          userId: userId,
          role: TeamMemberRole.MEMBER
        }
      });

      // Update registration
      await tx.hackathonRegistration.update({
        where: { id: registration.id },
        data: { teamId: team.id }
      });

      // Update team size
      const updatedTeam = await tx.hackathonTeam.update({
        where: { id: team.id },
        data: { 
          currentSize: { increment: 1 },
          status: team.currentSize + 1 >= team.hackathon.minTeamSize ? TeamStatus.COMPLETE : TeamStatus.FORMING
        }
      });

      return updatedTeam;
    });
  }

  /**
   * Get team details
   */
  async getTeamDetails(teamId: string) {
    const team = await prisma.hackathonTeam.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        submission: true
      }
    });

    if (!team) throw new NotFoundError('Team not found');
    return team;
  }
}

export const teamService = new TeamService();
