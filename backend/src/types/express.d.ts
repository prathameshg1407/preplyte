// // src/types/express.d.ts

// import { UserRole } from '@prisma/client';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         email: string;
//         role: UserRole;
//         instituteId: string | null;
//       };
//     }
//   }
// }

// export {};


import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      instituteAdmin?: {
        userId: string;
        instituteId: string;
        role: string;
      };
    }
  }
}

export {};
