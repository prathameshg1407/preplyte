// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { seedLmsData } from './lms-seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await seedLmsData();

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });