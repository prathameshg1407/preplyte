import { PrismaClient } from '@prisma/client';
import { seedLmsData } from './seeds/lms-seed';
import { seedResumeTemplates } from '../src/module/resume-builder/seeds/templates.seed';
import { seedAllData } from './seeds/comprehensive-seed';

import {
  PrismaClient,
  UserRole,
  QuestionType,
  DifficultyLevel,
  TestCaseType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

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

async function seed() {
  try {
    // ==================== INSTITUTES ====================
    const institutesData = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'prisma/data/institutes.json'),
        'utf-8'
      )
    );

    for (const institute of institutesData) {
      await prisma.institute.upsert({
        where: { domain: institute.domain },
        update: {
          name: institute.name,
          isActive: institute.isActive ?? true,
        },
        create: {
          id: institute.id,
          domain: institute.domain,
          name: institute.name,
          isActive: institute.isActive ?? true,
        },
      });
    }
    console.log(`✅ Seeded ${institutesData.length} institutes`);

    // ==================== USERS ====================
    const usersData = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'prisma/data/users.json'),
        'utf-8'
      )
    );

    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      let instituteId: string | null = null;
      if (userData.instituteDomain) {
        const institute = await prisma.institute.findUnique({
          where: { domain: userData.instituteDomain },
        });
        instituteId = institute?.id ?? null;
      }

      await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          name: userData.name,
          role: userData.role as UserRole,
          instituteId,
          isActive: userData.isActive ?? true,
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role as UserRole,
          instituteId,
          isActive: userData.isActive ?? true,
        },
      });
    }
    console.log(`✅ Seeded ${usersData.length} users`);

    // ==================== APTITUDE QUESTIONS ====================
    const aptitudeQuestionsData: AptitudeQuestionData[] = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'prisma/data/aptitude-questions.json'),
        'utf-8'
      )
    );

    // Clear existing aptitude data for clean re-seeding
    await prisma.aptitudeOption.deleteMany({});
    await prisma.aptitudeQuestion.deleteMany({});

    for (const questionData of aptitudeQuestionsData) {
      // First create options to get their IDs
      const optionIds: Record<string, string> = {};

      const question = await prisma.aptitudeQuestion.create({
        data: {
          questionText: questionData.questionText,
          questionType: questionData.questionType as QuestionType,
          difficulty: questionData.difficulty as DifficultyLevel,
          explanation: questionData.explanation,
          correctOptionId: '', // Temporary, will update after creating options
          isActive: true,
        },
      });

      // Create options
      for (const optionData of questionData.options) {
        const option = await prisma.aptitudeOption.create({
          data: {
            text: optionData.text,
            questionId: question.id,
          },
        });
        optionIds[optionData.id] = option.id;
      }

      // Update question with correct option ID
      await prisma.aptitudeQuestion.update({
        where: { id: question.id },
        data: {
          correctOptionId: optionIds[questionData.correctOptionId],
        },
      });
    }
    console.log(`✅ Seeded ${aptitudeQuestionsData.length} aptitude questions`);

    // ==================== MACHINE QUESTIONS ====================
    const machineQuestionsData: MachineQuestionData[] = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'prisma/data/machine-tests.json'),
        'utf-8'
      )
    );

    // Clear existing machine data for clean re-seeding
    await prisma.testCase.deleteMany({});
    await prisma.machineQuestion.deleteMany({});

    let totalTestCases = 0;

    for (const questionData of machineQuestionsData) {
      const machineQuestion = await prisma.machineQuestion.create({
        data: {
          title: questionData.title,
          description: questionData.description,
          difficulty: questionData.difficulty as DifficultyLevel,
          inputFormat: questionData.inputFormat,
          outputFormat: questionData.outputFormat,
          constraints: questionData.constraints,
          tags: questionData.tags,
          isActive: true,
        },
      });

      // Create test cases for this question
      for (let i = 0; i < questionData.testCases.length; i++) {
        const testCaseData = questionData.testCases[i];
        await prisma.testCase.create({
          data: {
            input: testCaseData.input,
            expectedOutput: testCaseData.expectedOutput,
            type: testCaseData.type as TestCaseType,
            order: testCaseData.order ?? i,
            questionId: machineQuestion.id,
          },
        });
        totalTestCases++;
      }
    }
    console.log(
      `✅ Seeded ${machineQuestionsData.length} machine questions with ${totalTestCases} test cases`
    );

    // ==================== PROGRAMMING LANGUAGES ====================
    const programmingLanguagesData: ProgrammingLanguageData[] = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'prisma/data/programming-languages.json'),
        'utf-8'
      )
    );

    for (const langData of programmingLanguagesData) {
      await prisma.programmingLanguage.upsert({
        where: { judge0Id: langData.judge0Id },
        update: {
          name: langData.name,
          monacoId: langData.monacoId,
          template: langData.template,
          isActive: langData.isActive ?? true,
        },
        create: {
          name: langData.name,
          monacoId: langData.monacoId,
          judge0Id: langData.judge0Id,
          template: langData.template,
          isActive: langData.isActive ?? true,
        },
      });
    }
    console.log(
      `✅ Seeded ${programmingLanguagesData.length} programming languages`
    );

    // ==================== SUMMARY ====================
    console.log('');
    console.log('✅ Database seeded successfully');
    console.log('─'.repeat(40));
    console.log(`   📁 Institutes:            ${institutesData.length}`);
    console.log(`   👥 Users:                 ${usersData.length}`);
    console.log(`   📝 Aptitude Questions:    ${aptitudeQuestionsData.length}`);
    console.log(`   💻 Machine Questions:     ${machineQuestionsData.length}`);
    console.log(`   🧪 Test Cases:            ${totalTestCases}`);
    console.log(`   🔧 Programming Languages: ${programmingLanguagesData.length}`);
    console.log('─'.repeat(40));
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();