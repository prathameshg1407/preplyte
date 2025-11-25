import { PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/db';

type PrismaTransactionClient = Parameters<
  Parameters<(typeof prisma)['$transaction']>[0]
>[0];

type PrismaPromise<T> = Promise<T> & { [Symbol.toStringTag]: 'PrismaPromise' };
type UnwrapTuple<Tuple extends readonly unknown[]> = {
  [K in keyof Tuple]: Tuple[K] extends PrismaPromise<infer X> ? X : never;
};

export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }

  get client(): PrismaClient {
    return prisma;
  }
   getPrismaClient(): PrismaClient {
    return prisma;
  }

  get aiInterviewSession() {
    return prisma.aiInterviewSession;
  }

  get aiInterviewResponse() {
    return prisma.aiInterviewResponse;
  }

  get aiInterviewFeedback() {
    return prisma.aiInterviewFeedback;
  }

  get resume() {
    return prisma.resume;
  }

  get user() {
    return prisma.user;
  }

  // Correct $transaction overloads
  $transaction<T>(fn: (prisma: PrismaTransactionClient) => Promise<T>): Promise<T>;
  $transaction<P extends PrismaPromise<any>[]>(
    queries: [...P]
  ): Promise<UnwrapTuple<P>>;
  $transaction<T>(
    arg: ((prisma: PrismaTransactionClient) => Promise<T>) | PrismaPromise<any>[]
  ): Promise<T | any[]> {
    if (Array.isArray(arg)) {
      return prisma.$transaction(arg);
    }
    return prisma.$transaction(arg);
  }

  async $disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

export const prismaService = new PrismaService();
