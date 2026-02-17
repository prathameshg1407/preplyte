
import { PrismaClient, MockDriveStatus } from '@prisma/client';
import { logger } from '../../../utils/logger';

/**
 * Updates the status of mock drives based on their schedule.
 * This function is designed to be called lazily (e.g., on list/get requests)
 * to ensure data consistency without heavy background jobs.
 */
export async function updateMockDriveStatuses(prisma: PrismaClient): Promise<void> {
    const now = new Date();

    try {
        // 1. Mark as COMPLETED if driveEndDate has passed
        const completed = await prisma.mockDrive.updateMany({
            where: {
                status: { not: MockDriveStatus.COMPLETED },
                driveEndDate: { not: null, lte: now },
            },
            data: { status: MockDriveStatus.COMPLETED },
        });

        if (completed.count > 0) {
            logger.info(`Auto-updated ${completed.count} drives to COMPLETED`);
        }

        // 2. Mark as IN_PROGRESS if driveStartDate passed and not ended
        const inProgress = await prisma.mockDrive.updateMany({
            where: {
                status: {
                    notIn: [MockDriveStatus.COMPLETED, MockDriveStatus.IN_PROGRESS]
                },
                driveStartDate: { not: null, lte: now },
                OR: [
                    { driveEndDate: null },
                    { driveEndDate: { gt: now } }
                ]
            },
            data: { status: MockDriveStatus.IN_PROGRESS },
        });

        if (inProgress.count > 0) {
            logger.info(`Auto-updated ${inProgress.count} drives to IN_PROGRESS`);
        }

        // 3. Mark as REGISTRATION_CLOSED if registrationEndDate passed (and not started)
        // catch-up for PUBLISHED drives that missed the open window
        const closed = await prisma.mockDrive.updateMany({
            where: {
                status: {
                    in: [MockDriveStatus.PUBLISHED, MockDriveStatus.REGISTRATION_OPEN]
                },
                registrationEndDate: { not: null, lte: now },
                // Ensure we don't overwrite IN_PROGRESS (handled by clause above checking status)
                // But explicitly: drive shouldn't have started yet, or start date is future
                OR: [
                    { driveStartDate: null },
                    { driveStartDate: { gt: now } }
                ]
            },
            data: { status: MockDriveStatus.REGISTRATION_CLOSED },
        });

        if (closed.count > 0) {
            logger.info(`Auto-updated ${closed.count} drives to REGISTRATION_CLOSED`);
        }

        // 4. Mark as REGISTRATION_OPEN if registrationStartDate passed and still open
        const opened = await prisma.mockDrive.updateMany({
            where: {
                status: MockDriveStatus.PUBLISHED,
                registrationStartDate: { not: null, lte: now },
                OR: [
                    { registrationEndDate: null },
                    { registrationEndDate: { gt: now } }
                ]
            },
            data: { status: MockDriveStatus.REGISTRATION_OPEN },
        });

        if (opened.count > 0) {
            logger.info(`Auto-updated ${opened.count} drives to REGISTRATION_OPEN`);
        }

    } catch (error) {
        logger.error('Failed to auto-update mock drive statuses', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
