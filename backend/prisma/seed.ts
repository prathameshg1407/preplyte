import { PrismaClient } from '@prisma/client';
import { seedAllData } from './seeds/comprehensive-seed';
import { seedLmsData } from './seeds/lms-seed';
import { seedResumeTemplates } from '../src/module/resume-builder/seeds/templates.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...\n');

  try {
    // 1. Seed Core Data (Institutes, Users, Questions, Languages)
    await seedAllData();

    // 2. Seed LMS Data (Categories, Courses, etc.)
    await seedLmsData();

    // 3. Seed Resume Templates
    await seedResumeTemplates(prisma);

    console.log('\n✅ All database seeding completed!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();