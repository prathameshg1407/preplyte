// prisma/seeds/lms-seed.ts

import { PrismaClient, DifficultyLevel, LmsCourseStatus, LmsModule } from '@prisma/client';
import { lmsCourses } from './lms-courses';

const prisma = new PrismaClient();

export async function seedLmsData() {
  console.log('Seeding LMS data...');

  // Create Categories
  const categories = await Promise.all([
    prisma.lmsCategory.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Learn to build modern web applications',
        order: 1,
        isActive: true,
      },
    }),
    prisma.lmsCategory.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        description: 'Master programming fundamentals and DSA',
        order: 2,
        isActive: true,
      },
    }),
    prisma.lmsCategory.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Learn data analysis and machine learning',
        order: 3,
        isActive: true,
      },
    }),
  ]);

  for (const courseData of lmsCourses) {
    const { modules, finalTest, ...courseFields } = courseData;

    const course = await prisma.lmsCourse.upsert({
      where: { slug: courseData.slug },
      update: {
        ...courseFields,
        categoryId: courseData.categoryId === 'cat_programming' ? categories[1].id : categories[0].id,
      },
      create: {
        ...courseFields,
        categoryId: courseData.categoryId === 'cat_programming' ? categories[1].id : categories[0].id,
      },
    });

    for (const moduleData of modules) {
      const { topics, moduleTest, ...moduleFields } = moduleData;

      const module = await prisma.lmsModule.upsert({
        where: {
          courseId_order: {
            courseId: course.id,
            order: moduleData.order,
          },
        },
        update: moduleFields,
        create: {
          courseId: course.id,
          ...moduleFields,
        },
      });

      for (const topicData of topics) {
        await prisma.lmsTopic.upsert({
          where: {
            moduleId_order: {
              moduleId: module.id,
              order: topicData.order,
            },
          },
          update: topicData,
          create: {
            moduleId: module.id,
            ...topicData,
          },
        });
      }

      if (moduleTest) {
        const { questions, ...testFields } = moduleTest;
        const mTest = await prisma.lmsModuleTest.upsert({
          where: { moduleId: module.id },
          update: testFields,
          create: {
            moduleId: module.id,
            ...testFields,
          },
        });

        for (const questionData of questions) {
          const { options, ...questionFields } = questionData;

          // Find existing question or create new one
          let question = await prisma.lmsTestQuestion.findFirst({
            where: {
              moduleTestId: mTest.id,
              order: questionData.order,
            },
          });

          if (question) {
            question = await prisma.lmsTestQuestion.update({
              where: { id: question.id },
              data: questionFields,
            });
          } else {
            question = await prisma.lmsTestQuestion.create({
              data: {
                moduleTestId: mTest.id,
                ...questionFields,
              },
            });
          }

          // Create/update options
          for (const optionData of options) {
            const existingOption = await prisma.lmsTestOption.findFirst({
              where: {
                questionId: question.id,
                order: optionData.order,
              },
            });

            if (existingOption) {
              await prisma.lmsTestOption.update({
                where: { id: existingOption.id },
                data: optionData,
              });
            } else {
              await prisma.lmsTestOption.create({
                data: {
                  questionId: question.id,
                  ...optionData,
                },
              });
            }
          }
        }
      }
    }

    if (finalTest) {
      const { questions, ...testFields } = finalTest;
      const fTest = await prisma.lmsFinalTest.upsert({
        where: { courseId: course.id },
        update: testFields,
        create: {
          courseId: course.id,
          ...testFields,
        },
      });

      for (const questionData of questions) {
        const { options, ...questionFields } = questionData;

        let question = await prisma.lmsTestQuestion.findFirst({
          where: {
            finalTestId: fTest.id,
            order: questionData.order,
          },
        });

        if (question) {
          question = await prisma.lmsTestQuestion.update({
            where: { id: question.id },
            data: questionFields,
          });
        } else {
          question = await prisma.lmsTestQuestion.create({
            data: {
              finalTestId: fTest.id,
              ...questionFields,
            },
          });
        }

        for (const optionData of options) {
          const existingOption = await prisma.lmsTestOption.findFirst({
            where: {
              questionId: question.id,
              order: optionData.order,
            },
          });

          if (existingOption) {
            await prisma.lmsTestOption.update({
              where: { id: existingOption.id },
              data: optionData,
            });
          } else {
            await prisma.lmsTestOption.create({
              data: {
                questionId: question.id,
                ...optionData,
              },
            });
          }
        }
      }
    }
  }

  console.log('LMS seed data created successfully!');
}