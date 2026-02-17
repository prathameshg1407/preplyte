import { PrismaClient } from '@prisma/client';
import { seedLmsData } from './seeds/lms-seed';
import { seedResumeTemplates } from '../src/module/resume-builder/seeds/templates.seed';
import { seedAllData } from './seeds/comprehensive-seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...\n');

  // Seed all data from JSON files
  await seedAllData();
  
  // Seed LMS data
  await seedLmsData();
  
  // Seed resume templates
  await seedResumeTemplates(prisma);

  console.log('\n✅ All database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });