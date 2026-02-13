import { PrismaClient } from '@prisma/client';
import { seedLmsData } from './seeds/lms-seed';
import { seedResumeTemplates } from '../src/module/resume-builder/seeds/templates.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await seedLmsData();
  await seedResumeTemplates(prisma);

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