// backend/src/module/event/hackathon/registration/registration.service.ts

import { prisma } from '../../../../lib/db';
import { HackathonStatus, HackathonRegistrationStatus } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
} from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';
import { RegisterHackathonInput } from '../hackathon.types';
import { checkEligibility } from '../../shared/eligibility.utils';

export class RegistrationService {
  /**
   * Register a user for a hackathon
   */
  async register(input: RegisterHackathonInput, userId: string) {
    logger.info('[RegistrationService] Registering user', { hackathonId: input.hackathonId, userId });

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: input.hackathonId, isDeleted: false }
    });

    if (!hackathon) throw new NotFoundError('Hackathon not found');
    
    // Check if registration is open
    const now = new Date();
    if (now < hackathon.registrationStartDate || now > hackathon.registrationEndDate) {
      throw new BadRequestError('Registration is not open for this hackathon');
    }

    // Check status
    if (hackathon.status !== HackathonStatus.REGISTRATION_OPEN && hackathon.status !== HackathonStatus.PUBLISHED) {
       throw new BadRequestError('Hackathon is not accepting registrations');
    }

    // Check already registered
    const existing = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: input.hackathonId, userId } }
    });

    if (existing) throw new BadRequestError('You are already registered for this hackathon');

    // Check capacity
    if (hackathon.maxParticipants && hackathon.participantCount >= hackathon.maxParticipants) {
      throw new BadRequestError('Hackathon capacity has been reached');
    }

    // Check eligibility (if criteria is set)
    if (hackathon.eligibilityCriteria) {
      const eligibilityResult = await checkEligibility(userId, hackathon.eligibilityCriteria as any);
      if (!eligibilityResult.eligible) {
        throw new BadRequestError(`Ineligible: ${eligibilityResult.reasons.join(', ')}`);
      }
    }

    if (hackathon.isResumeRequired && !input.resumeId) {
      throw new BadRequestError('Resume is required for this hackathon');
    }

    // Register
    return await prisma.$transaction(async (tx) => {
      const registration = await tx.hackathonRegistration.create({
        data: {
          hackathonId: input.hackathonId,
          userId: userId,
          resumeId: input.resumeId,
          status: HackathonRegistrationStatus.REGISTERED
        }
      });

      // Update counters
      await tx.hackathon.update({
        where: { id: input.hackathonId },
        data: { 
          registrationsStarted: { increment: 1 },
          participantCount: { increment: 1 }
        }
      });

      return registration;
    });
  }

  /**
   * Get registration status
   */
  async getRegistration(hackathonId: string, userId: string) {
    return await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId, userId } },
      include: { team: true }
    });
  }

  /**
   * List registrations for a hackathon (Admin only)
   */
  async listRegistrations(hackathonId: string) {
    return await prisma.hackathonRegistration.findMany({
      where: { hackathonId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } }
      }
    });
  }
}

export const registrationService = new RegistrationService();
