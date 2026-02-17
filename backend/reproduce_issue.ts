
import { courseService } from './src/module/admin/lms/course/course.service';
import { prisma } from './src/lib/db';
import { LmsCourseStatus, DifficultyLevel } from '@prisma/client';
import fs from 'fs';

async function main() {
    const category = await prisma.lmsCategory.findFirst();
    if (!category) {
        console.error('No category found. Please create one first.');
        process.exit(1);
    }
    const categoryId = category.id;
    console.log('Using Category ID:', categoryId);

    const slug = 'test-course-' + Date.now();
    console.log('Creating course with final test...');

    try {
        const created = await courseService.create({
            categoryId: categoryId,
            title: 'Test Course',
            slug: slug,
            shortDescription: 'Test',
            description: 'Test',
            price: 0,
            currency: 'INR',
            status: LmsCourseStatus.DRAFT,
            isActive: true,
            certificateEnabled: true,
            passingPercentage: 60,
            tags: [],
            difficulty: DifficultyLevel.MEDIUM,
            language: 'English',
            modules: [],
            finalTest: {
                title: 'Final Test',
                totalQuestions: 1,
                passingScore: 60,
                timeLimitMinutes: 30,
                maxAttempts: 1,
                pointsPerQuestion: 10,
                isActive: true,
                questions: [
                    {
                        questionText: 'Q1',
                        order: 1,
                        points: 10,
                        isActive: true,
                        options: [
                            { text: 'A', isCorrect: true, order: 1 },
                            { text: 'B', isCorrect: false, order: 2 }
                        ]
                    }
                ]
            }
        });

        console.log('Course created. ID:', created.id);

        const fetched = await courseService.findOne(created.id);
        if (fetched.finalTest && fetched.finalTest.questions && fetched.finalTest.questions.length > 0) {
            console.log('SUCCESS: Final test questions created. Count:', fetched.finalTest.questions.length);
        } else {
            console.error('FAILURE: Final test questions NOT created.');
        }

        console.log('Updating course with new final test questions...');
        const updated = await courseService.update(created.id, {
            finalTest: {
                title: 'Final Test Updated',
                totalQuestions: 2,
                passingScore: 60,
                timeLimitMinutes: 30,
                maxAttempts: 1,
                pointsPerQuestion: 10,
                isActive: true,
                questions: [
                    {
                        // Existing question with ID
                        id: fetched.finalTest!.questions[0].id,
                        questionText: 'Q1 Updated',
                        order: 1,
                        points: 10,
                        isActive: true,
                        options: [
                            { text: 'A', isCorrect: true, order: 1 },
                            { text: 'B', isCorrect: false, order: 2 }
                        ]
                    },
                    {
                        // New question
                        questionText: 'Q2',
                        order: 2,
                        points: 10,
                        isActive: true,
                        options: [
                            { text: 'C', isCorrect: true, order: 1 },
                            { text: 'D', isCorrect: false, order: 2 }
                        ]
                    }
                ]
            }
        });

        const fetchedUpdated = await courseService.findOne(created.id);
        if (fetchedUpdated.finalTest && fetchedUpdated.finalTest.questions.length === 2) {
            console.log('SUCCESS: Final test questions updated. Count:', fetchedUpdated.finalTest?.questions.length);
        }

        const resultData = {
            created: { id: created.id },
            finalTestCreated: fetched.finalTest && fetched.finalTest.questions && fetched.finalTest.questions.length > 0,
            finalTestQuestionsCount: fetched.finalTest?.questions?.length,
            updated: { id: updated.id },
            finalTestUpdated: fetchedUpdated.finalTest && fetchedUpdated.finalTest.questions.length === 2,
            finalTestUpdatedCount: fetchedUpdated.finalTest?.questions?.length,
            q1Updated: !!(fetchedUpdated.finalTest?.questions.find(q => q.questionText === 'Q1 Updated')),
            q1OptionsCount: fetchedUpdated.finalTest?.questions.find(q => q.questionText === 'Q1 Updated')?.options.length
        };

        fs.writeFileSync('result.json', JSON.stringify(resultData, null, 2));

        // Cleanup
        await courseService.delete(created.id);
        console.log('Cleanup done.');

    } catch (e) {
        console.error(e);
        fs.writeFileSync('result.json', JSON.stringify({ error: e.message }, null, 2));
    }
}

main();
