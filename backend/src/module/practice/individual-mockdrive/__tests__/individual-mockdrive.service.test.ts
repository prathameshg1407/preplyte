/// <reference types="jest" />
import { MockDriveModuleAttemptStatus, MockDriveModuleType } from '@prisma/client';

jest.mock('../../../../lib/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    individualMockDrive: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    individualMockDriveAttempt: {
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    individualMockDriveModuleAttempt: {
      createMany: jest.fn(),
      update: jest.fn(),
    },
    aptitudePracticeSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    machinePracticeSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    aiInterviewSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '../../../../lib/db';
import { individualMockDriveService } from '../individual-mockdrive.service';

const mockedPrisma = prisma as any;

describe('IndividualMockDriveService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes getAttemptById by userId', async () => {
    mockedPrisma.individualMockDriveAttempt.findFirst.mockResolvedValue({ id: 'attempt-1' });

    await individualMockDriveService.getAttemptById('attempt-1', 'user-1');

    expect(mockedPrisma.individualMockDriveAttempt.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'attempt-1', userId: 'user-1' },
      })
    );
  });

  it('throws when getAttemptById cannot find the attempt', async () => {
    mockedPrisma.individualMockDriveAttempt.findFirst.mockResolvedValue(null);

    await expect(
      individualMockDriveService.getAttemptById('attempt-404', 'user-1')
    ).rejects.toThrow('Attempt not found');
  });

  it('returns completed attempt details from sync when last module completes', async () => {
    const currentAttempt = {
      id: 'attempt-1',
      mockDriveId: 'drive-1',
      moduleAttempts: [
        {
          id: 'ma-1',
          status: MockDriveModuleAttemptStatus.IN_PROGRESS,
          moduleData: { sessionId: 'session-1' },
          percentage: null,
          module: {
            order: 0,
            moduleType: MockDriveModuleType.APTITUDE,
          },
        },
      ],
    };

    const updatedAttempt = {
      id: 'attempt-1',
      mockDriveId: 'drive-1',
      moduleAttempts: [
        {
          id: 'ma-1',
          status: MockDriveModuleAttemptStatus.COMPLETED,
          moduleData: { sessionId: 'session-1' },
          percentage: 80,
          module: {
            order: 0,
            moduleType: MockDriveModuleType.APTITUDE,
          },
        },
      ],
    };

    const completedAttempt = { id: 'attempt-1', status: 'COMPLETED' };

    // Mock getCurrentAttempt to return current attempt first, then updated attempt
    let callCount = 0;
    jest
      .spyOn(individualMockDriveService, 'getCurrentAttempt')
      .mockImplementation(async () => {
        callCount++;
        return callCount === 1 ? (currentAttempt as any) : (updatedAttempt as any);
      });
    jest
      .spyOn(individualMockDriveService, 'getAttemptById')
      .mockResolvedValue(completedAttempt as any);

    mockedPrisma.aptitudePracticeSession.findUnique.mockResolvedValue({
      completedAt: new Date(),
      totalScore: 8,
      numberOfQuestions: 10,
    });
    mockedPrisma.individualMockDriveModuleAttempt.update.mockResolvedValue({});
    mockedPrisma.individualMockDriveAttempt.update.mockResolvedValue({});

    const result = await individualMockDriveService.syncAttempt('user-1');

    expect(mockedPrisma.individualMockDriveAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'attempt-1' },
      })
    );
    expect(individualMockDriveService.getAttemptById).toHaveBeenCalledWith('attempt-1', 'user-1');
    expect(result).toEqual(completedAttempt);
  });
});
