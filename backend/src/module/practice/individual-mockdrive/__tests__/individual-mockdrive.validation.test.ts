/// <reference types="jest" />
import { MockDriveModuleType } from '@prisma/client';
import { createIndividualMockDriveSchema } from '../individual-mockdrive.validation';

describe('individual-mockdrive validation', () => {
  const basePayload = {
    title: 'My practice drive',
    description: 'Practice set',
    modules: [
      {
        moduleType: MockDriveModuleType.APTITUDE,
        order: 0,
        name: 'Aptitude',
        timeLimit: 20,
        config: {
          difficulty: 'MEDIUM',
          questionTypes: ['QUANTITATIVE'],
          numberOfQuestions: 10,
        },
      },
    ],
  };

  it('rejects moduleType-config mismatches', () => {
    const payload = {
      ...basePayload,
      modules: [
        {
          ...basePayload.modules[0],
          moduleType: MockDriveModuleType.APTITUDE,
          config: {
            difficulty: 'MEDIUM',
            numberOfQuestions: 2,
          },
        },
      ],
    };

    expect(() => createIndividualMockDriveSchema.parse(payload)).toThrow();
  });

  it('rejects non-contiguous module order', () => {
    const payload = {
      ...basePayload,
      modules: [
        basePayload.modules[0],
        {
          moduleType: MockDriveModuleType.MACHINE_CODING,
          order: 2,
          name: 'Coding',
          timeLimit: 40,
          config: {
            difficulty: 'MEDIUM',
            numberOfQuestions: 1,
          },
        },
      ],
    };

    expect(() => createIndividualMockDriveSchema.parse(payload)).toThrow(
      /Module order must start at 0 and be contiguous/
    );
  });

  it('accepts valid contiguous module order and matching configs', () => {
    const payload = {
      ...basePayload,
      modules: [
        basePayload.modules[0],
        {
          moduleType: MockDriveModuleType.AI_INTERVIEW,
          order: 1,
          name: 'Interview',
          timeLimit: 25,
          config: {
            difficulty: 'MID',
            jobTitle: 'Software Engineer',
            companyName: 'Acme',
            focusAreas: ['React'],
            targetQuestions: 6,
          },
        },
      ],
    };

    expect(() => createIndividualMockDriveSchema.parse(payload)).not.toThrow();
  });
});
