/// <reference types="jest" />
import { individualMockDriveController } from '../individual-mockdrive.controller';
import { individualMockDriveService } from '../individual-mockdrive.service';

describe('IndividualMockDriveController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 for getAttemptDetails when user is missing', async () => {
    const req = {
      params: { attemptId: 'attempt-1' },
      user: undefined,
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const getAttemptByIdSpy = jest.spyOn(individualMockDriveService, 'getAttemptById');

    await individualMockDriveController.getAttemptDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(getAttemptByIdSpy).not.toHaveBeenCalled();
  });

  it('calls service with attemptId and userId when authorized', async () => {
    const req = {
      params: { attemptId: 'attempt-1' },
      user: { id: 'user-1' },
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const mockAttempt = { id: 'attempt-1' };
    const getAttemptByIdSpy = jest
      .spyOn(individualMockDriveService, 'getAttemptById')
      .mockResolvedValue(mockAttempt as any);

    await individualMockDriveController.getAttemptDetails(req, res);

    expect(getAttemptByIdSpy).toHaveBeenCalledWith('attempt-1', 'user-1');
    expect(res.json).toHaveBeenCalledWith(mockAttempt);
  });
});
