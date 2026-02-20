// prisma/seeds/comprehensive-seed.ts

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read JSON files
function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Seed Institutes
async function seedInstitutes() {
  console.log('Seeding institutes...');

  const institutes = readJsonFile<Array<{
    id: string;
    name: string;
    domain: string;
    isActive: boolean;
  }>>('institutes.json');

  for (const institute of institutes) {
    await prisma.institute.upsert({
      where: { id: institute.id },
      update: {},
      create: {
        id: institute.id,
        name: institute.name,
        domain: institute.domain,
        isActive: institute.isActive,
      },
    });
  }

  console.log(`✓ Seeded ${institutes.length} institutes`);
}

// Seed Users
async function seedUsers() {
  console.log('Seeding users...');

  const users = readJsonFile<Array<{
    email: string;
    password: string;
    name: string;
    role: string;
    instituteDomain: string | null;
    isActive: boolean;
  }>>('users.json');

  for (const user of users) {
    // Find institute by domain if provided
    let instituteId: string | null = null;
    if (user.instituteDomain) {
      const institute = await prisma.institute.findUnique({
        where: { domain: user.instituteDomain },
      });
      instituteId = institute?.id || null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role as UserRole,
        instituteId,
        isActive: user.isActive,
      },
    });
  }

  console.log(`✓ Seeded ${users.length} users`);
}

// Seed Programming Languages
async function seedProgrammingLanguages() {
  console.log('Seeding programming languages...');

  const languages = readJsonFile<Array<{
    name: string;
    monacoId: string;
    judge0Id: number;
    template: string;
    isActive: boolean;
  }>>('programming-languages.json');

  for (const lang of languages) {
    await prisma.programmingLanguage.upsert({
      where: { judge0Id: lang.judge0Id },
      update: {},
      create: {
        name: lang.name,
        monacoId: lang.monacoId,
        judge0Id: lang.judge0Id,
        template: lang.template,
        isActive: lang.isActive,
      },
    });
  }

  console.log(`✓ Seeded ${languages.length} programming languages`);
}

// Seed Aptitude Questions
async function seedAptitudeQuestions() {
  console.log('Seeding aptitude questions...');

  const questions = readJsonFile<Array<{
    questionText: string;
    questionType: string;
    difficulty: string;
    explanation: string;
    correctAnswerId: string;
    options: Array<{ optionId: string; text: string }>;
  }>>('aptitude-questions.json');

  let count = 0;
  for (const question of questions) {
    const created = await prisma.aptitudeQuestion.create({
      data: {
        questionText: question.questionText,
        questionType: question.questionType as any,
        difficulty: question.difficulty as any,
        explanation: question.explanation,
        correctOptionId: '', // Will be updated after creating options
        options: {
          create: question.options.map(opt => ({
            text: opt.text,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Find the correct option and update the question
    const correctOptionIndex = question.options.findIndex(opt => opt.optionId === question.correctAnswerId);
    const correctOption = correctOptionIndex !== -1 ? created.options[correctOptionIndex] : null;

    if (correctOption) {
      await prisma.aptitudeQuestion.update({
        where: { id: created.id },
        data: { correctOptionId: correctOption.id },
      });
    }

    count++;
  }

  console.log(`✓ Seeded ${count} aptitude questions`);
}

// Seed Machine Coding Questions
async function seedMachineCodingTests() {
  console.log('Seeding machine coding questions...');

  const questions = readJsonFile<Array<{
    title: string;
    description: string;
    difficulty: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string[];
    tags: string[];
    testCases: Array<{
      input: string;
      expectedOutput: string;
      type: string;
      order?: number;
    }>;
  }>>('machine-tests.json');

  // Clear existing machine data
  await prisma.testCase.deleteMany({});
  await prisma.machineQuestion.deleteMany({});

  let count = 0;
  let testCasesCount = 0;

  for (const question of questions) {
    const machineQuestion = await prisma.machineQuestion.create({
      data: {
        title: question.title,
        description: question.description,
        difficulty: question.difficulty as any,
        inputFormat: question.inputFormat,
        outputFormat: question.outputFormat,
        constraints: question.constraints,
        tags: question.tags,
        isActive: true,
      },
    });

    // Create test cases
    for (let i = 0; i < question.testCases.length; i++) {
      const tc = question.testCases[i];
      await prisma.testCase.create({
        data: {
          questionId: machineQuestion.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          type: tc.type as any,
          order: tc.order ?? i,
        },
      });
      testCasesCount++;
    }
    count++;
  }

  console.log(`✓ Seeded ${count} machine questions with ${testCasesCount} test cases`);
}

export async function seedAllData() {
  console.log('Starting comprehensive database seeding...\n');

  try {
    await seedInstitutes();
    await seedUsers();
    await seedProgrammingLanguages();
    await seedAptitudeQuestions();
    await seedMachineCodingTests();

    console.log('\n✅ Comprehensive seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}
