import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    // Extend the User interface used by Passport/Express
    interface User {
      id: string;
      email: string;
      role: UserRole;
      instituteId: string | null;
      tokenVersion: number;
    }

    interface Request {
      // Add custom properties to Request
      instituteAdmin?: {
        userId: string;
        instituteId: string;
        role: string;
      };
    }
  }
}

export { };
