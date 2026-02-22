// backend/src/module/event/hackathon/submission/submission.service.ts

import { prisma } from '../../../../lib/db';
import { HackathonStatus, HackathonSubmissionStatus, TeamStatus } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
} from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';
import { SubmitProjectInput, ReviewSubmissionInput } from '../hackathon.types';

export class SubmissionService {
  /**
   * Submit or update a project submission
   */
  async submitProject(input: SubmitProjectInput, userId: string) {
    logger.info('[SubmissionService] Submitting project', { hackathonId: input.hackathonId, userId });

    // 1. Check hackathon and timeline
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: input.hackathonId, isDeleted: false }
    });

    if (!hackathon) throw new NotFoundError('Hackathon not found');
    
    const now = new Date();
    if (now > hackathon.submissionDeadline) {
      throw new BadRequestError('Submission deadline has passed');
    }

    // 2. Find team/registration
    let teamId = input.teamId;
    
    if (!teamId) {
      // Check if user is in a team for this hackathon
      const registration = await prisma.hackathonRegistration.findUnique({
        where: { hackathonId_userId: { hackathonId: input.hackathonId, userId } }
      });

      if (!registration) throw new BadRequestError('You are not registered for this hackathon');
      teamId = registration.teamId || undefined;
    }

    // 3. Authorization (if team, must be a member)
    if (teamId) {
      const isMember = await prisma.teamMember.findFirst({
        where: { teamId, userId }
      });
      if (!isMember) throw new BadRequestError('You are not a member of this team');
    }

    // 4. Create or update submission
    const where: any = {};
    if (teamId) {
      where.teamId = teamId;
    } else {
      where.userId = userId;
      where.hackathonId = input.hackathonId;
    }

    const existing = await prisma.hackathonSubmission.findFirst({ where });

    if (existing) {
      return await prisma.hackathonSubmission.update({
        where: { id: existing.id },
        data: {
          projectName: input.projectName,
          projectDescription: input.projectDescription,
          techStack: input.techStack,
          repositoryUrl: input.repositoryUrl,
          demoUrl: input.demoUrl,
          videoUrl: input.videoUrl,
          presentationUrl: input.presentationUrl,
          screenshotsUrls: input.screenshotsUrls || [],
          status: HackathonSubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
          lastSavedAt: new Date()
        }
      });
    } else {
      return await prisma.hackathonSubmission.create({
        data: {
          hackathonId: input.hackathonId,
          teamId: teamId || null,
          userId: teamId ? null : userId,
          projectName: input.projectName,
          projectDescription: input.projectDescription,
          techStack: input.techStack,
          repositoryUrl: input.repositoryUrl,
          demoUrl: input.demoUrl,
          videoUrl: input.videoUrl,
          presentationUrl: input.presentationUrl,
          screenshotsUrls: input.screenshotsUrls || [],
          status: HackathonSubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
          lastSavedAt: new Date()
        }
      });
    }
  }

  /**
   * Save draft (doesn't change status to SUBMITTED)
   */
  async saveDraft(input: SubmitProjectInput, userId: string) {
     // Similar to submit project but status remains DRAFT
     // and validation is less strict
     const existing = await prisma.hackathonSubmission.findFirst({
       where: { 
         hackathonId: input.hackathonId,
         OR: [
           { teamId: input.teamId },
           { userId: userId }
         ]
       }
     });

     if (existing) {
       return await prisma.hackathonSubmission.update({
         where: { id: existing.id },
         data: {
           ...input,
           status: HackathonSubmissionStatus.DRAFT,
           lastSavedAt: new Date()
         }
       });
     } else {
       return await prisma.hackathonSubmission.create({
         data: {
           ...input,
           userId: input.teamId ? null : userId,
           status: HackathonSubmissionStatus.DRAFT,
           lastSavedAt: new Date()
         }
       });
     }
  }

  /**
   * Review submission (Admin only)
   */
  async reviewSubmission(id: string, input: ReviewSubmissionInput) {
    return await prisma.hackathonSubmission.update({
      where: { id },
      data: {
        status: input.status,
        score: input.score,
        rank: input.rank,
        feedback: input.feedback,
        prizeWon: input.prizeWon
      }
    });
  }

  /**
   * Get submission by ID
   */
  async getSubmission(id: string) {
    return await prisma.hackathonSubmission.findUnique({
      where: { id },
      include: {
        hackathon: true,
        team: { include: { members: { include: { user: true } } } },
        user: true
      }
    });
  }

  /**
   * List all submissions for a hackathon (Admin only)
   */
  async listSubmissions(hackathonId: string) {
    return await prisma.hackathonSubmission.findMany({
      where: { hackathonId },
      include: {
        team: { include: { members: { include: { user: true } } } },
        user: true
      },
      orderBy: { submittedAt: 'desc' }
    });
  }
}

export const submissionService = new SubmissionService();
