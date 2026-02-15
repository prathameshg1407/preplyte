import { prisma } from '../../../../lib/db';
import { CreateCourseDto, UpdateCourseDto } from './course.validation';
import { AppError } from '../../../../utils/errors';

export class CourseService {
    async create(input: CreateCourseDto) {
        const { modules, finalTest, ...data } = input;

        const existing = await prisma.lmsCourse.findUnique({ where: { slug: data.slug } });
        if (existing) {
            throw new AppError('CONFLICT', 'Course with this slug already exists', 409);
        }

        let totalModules = modules?.length || 0;
        let totalTopics = 0;
        let totalPoints = 0;
        let totalMinutes = 0;

        // Prepare nested modules and their topics/tests
        const modulesCreate = modules?.map((m) => {
            const moduleTopicsCount = m.topics?.length || 0;
            totalTopics += moduleTopicsCount;

            let moduleTestPoints = 0;
            if (m.moduleTest) {
                moduleTestPoints = m.moduleTest.totalQuestions * m.moduleTest.pointsPerQuestion;
            }

            totalPoints += (m.points || 0) + moduleTestPoints;

            // Minutes from module itself + each topic
            totalMinutes += m.estimatedMinutes || 0;
            m.topics?.forEach(t => {
                totalMinutes += t.estimatedMinutes || 0;
            });

            if (m.moduleTest) {
                totalMinutes += m.moduleTest.timeLimitMinutes || 0;
            }

            return {
                title: m.title,
                shortDescription: m.shortDescription || '',
                description: m.description || null,
                order: m.order,
                points: m.points,
                estimatedMinutes: m.estimatedMinutes,
                isActive: m.isActive,
                totalTopics: moduleTopicsCount,
                topics: m.topics ? {
                    create: m.topics.map(t => ({
                        title: t.title,
                        description: t.description || null,
                        order: t.order,
                        theoryContent: t.theoryContent || '',
                        videoUrl: t.videoUrl || null,
                        videoDuration: t.videoDuration || null,
                        estimatedMinutes: t.estimatedMinutes,
                        isActive: t.isActive,
                        resources: t.resources || []
                    }))
                } : undefined,
                moduleTest: m.moduleTest ? {
                    create: {
                        title: m.moduleTest.title,
                        instructions: m.moduleTest.instructions || null,
                        totalQuestions: m.moduleTest.totalQuestions,
                        passingScore: m.moduleTest.passingScore,
                        timeLimitMinutes: m.moduleTest.timeLimitMinutes,
                        maxAttempts: m.moduleTest.maxAttempts,
                        pointsPerQuestion: m.moduleTest.pointsPerQuestion,
                        totalPoints: moduleTestPoints,
                        isActive: m.moduleTest.isActive,
                        questions: m.moduleTest.questions && m.moduleTest.questions.length > 0 ? {
                            create: m.moduleTest.questions.map(q => ({
                                questionText: q.questionText,
                                explanation: q.explanation || null,
                                order: q.order,
                                points: q.points,
                                isActive: q.isActive,
                                options: {
                                    create: q.options.map(o => ({
                                        text: o.text,
                                        isCorrect: o.isCorrect,
                                        order: o.order
                                    }))
                                }
                            }))
                        } : undefined
                    }
                } : undefined
            };
        });

        let finalTestCreate: any = undefined;
        if (finalTest) {
            const finalTestPoints = finalTest.totalQuestions * finalTest.pointsPerQuestion;
            totalPoints += finalTestPoints;
            totalMinutes += finalTest.timeLimitMinutes || 0;

            finalTestCreate = {
                create: {
                    title: finalTest.title,
                    instructions: finalTest.instructions,
                    totalQuestions: finalTest.totalQuestions,
                    passingScore: finalTest.passingScore,
                    timeLimitMinutes: finalTest.timeLimitMinutes,
                    maxAttempts: finalTest.maxAttempts,
                    pointsPerQuestion: finalTest.pointsPerQuestion,
                    totalPoints: finalTestPoints,
                    isActive: finalTest.isActive,
                    questions: finalTest.questions && finalTest.questions.length > 0 ? {
                        create: finalTest.questions.map(q => ({
                            questionText: q.questionText,
                            explanation: q.explanation,
                            order: q.order,
                            points: q.points,
                            isActive: q.isActive,
                            options: {
                                create: q.options.map(o => ({
                                    text: o.text,
                                    isCorrect: o.isCorrect,
                                    order: o.order
                                }))
                            }
                        }))
                    } : undefined
                }
            };
        }

        const totalHours = Number((totalMinutes / 60).toFixed(2));

        return prisma.lmsCourse.create({
            data: {
                ...data,
                shortDescription: data.shortDescription || '',
                description: data.description || '',
                totalModules,
                totalTopics,
                totalPoints,
                totalHours,
                modules: modulesCreate ? {
                    create: modulesCreate
                } : undefined,
                finalTest: finalTestCreate
            },
            include: {
                category: true,
                modules: true,
                finalTest: true
            },
        });
    }

    async syncCourseStats(courseId: string) {
        const course = await prisma.lmsCourse.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        topics: true,
                        moduleTest: true
                    }
                },
                finalTest: true
            }
        });

        if (!course) return;

        let totalModules = course.modules.length;
        let totalTopics = 0;
        let totalPoints = 0;
        let totalMinutes = 0;

        for (const module of course.modules) {
            totalTopics += module.topics.length;

            let moduleTestPoints = 0;
            if (module.moduleTest) {
                moduleTestPoints = module.moduleTest.totalQuestions * module.moduleTest.pointsPerQuestion;
                // Update module test total points if needed
                if (module.moduleTest.totalPoints !== moduleTestPoints) {
                    await prisma.lmsModuleTest.update({
                        where: { id: module.moduleTest.id },
                        data: { totalPoints: moduleTestPoints }
                    });
                }
                totalMinutes += module.moduleTest.timeLimitMinutes || 0;
            }

            totalPoints += (module.points || 0) + moduleTestPoints;
            totalMinutes += module.estimatedMinutes || 0;

            for (const topic of module.topics) {
                totalMinutes += topic.estimatedMinutes || 0;
            }

            // Sync module totalTopics
            if (module.totalTopics !== module.topics.length) {
                await prisma.lmsModule.update({
                    where: { id: module.id },
                    data: { totalTopics: module.topics.length }
                });
            }
        }

        if (course.finalTest) {
            const finalTestPoints = course.finalTest.totalQuestions * course.finalTest.pointsPerQuestion;
            totalPoints += finalTestPoints;
            totalMinutes += course.finalTest.timeLimitMinutes || 0;

            if (course.finalTest.totalPoints !== finalTestPoints) {
                await prisma.lmsFinalTest.update({
                    where: { id: course.finalTest.id },
                    data: { totalPoints: finalTestPoints }
                });
            }
        }

        const totalHours = Number((totalMinutes / 60).toFixed(2));

        await prisma.lmsCourse.update({
            where: { id: courseId },
            data: {
                totalModules,
                totalTopics,
                totalPoints,
                totalHours
            }
        });
    }

    async findAll() {
        return prisma.lmsCourse.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                _count: {
                    select: {
                        modules: true,
                        enrollments: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const course = await prisma.lmsCourse.findUnique({
            where: { id },
            include: {
                category: true,
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        topics: {
                            orderBy: { order: 'asc' },
                        },
                        moduleTest: {
                            include: {
                                questions: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        options: {
                                            orderBy: { order: 'asc' }
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
                finalTest: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                options: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        if (!course) {
            throw new AppError('NOT_FOUND', 'Course not found', 404);
        }

        return course;
    }

    async update(id: string, input: UpdateCourseDto) {
        const course = await this.findOne(id);

        const { modules, finalTest, ...data } = input;

        if (data.slug) {
            const existing = await prisma.lmsCourse.findUnique({ where: { slug: data.slug } });
            if (existing && existing.id !== id) {
                throw new AppError('CONFLICT', 'Slug already taken', 409);
            }
        }

        // Handle nested curriculum updates
        const updatedCourse = await prisma.$transaction(async (tx) => {
            // Sanitize data to only include valid LmsCourse fields
            const sanitizedData: any = {};
            const validFields = [
                'title', 'slug', 'categoryId', 'shortDescription', 'description',
                'thumbnailUrl', 'previewVideoUrl', 'price', 'discountPrice',
                'currency', 'status', 'isActive', 'certificateEnabled',
                'passingPercentage', 'tags', 'difficulty', 'instructor', 'language'
            ];

            validFields.forEach(field => {
                if (data[field as keyof typeof data] !== undefined) {
                    let val = data[field as keyof typeof data];
                    // Correct common nullable issues for mandatory DB fields
                    if (val === null) {
                        if (field === 'shortDescription' || field === 'description') {
                            val = '';
                        }
                    }
                    sanitizedData[field] = val;
                }
            });

            // Update course basic data
            const updated = await tx.lmsCourse.update({
                where: { id },
                data: sanitizedData,
                include: { category: true }
            });

            // Update Final Test if provided
            if (finalTest) {
                const finalTestPoints = finalTest.totalQuestions * (finalTest.pointsPerQuestion || 10);
                if (course.finalTest) {
                    await tx.lmsFinalTest.update({
                        where: { id: course.finalTest.id },
                        data: {
                            ...(finalTest as any),
                            totalPoints: finalTestPoints,
                            questions: undefined // Don't update directly
                        }
                    });

                    // Update Questions
                    if (finalTest.questions) {
                        const existingQuestions = (course.finalTest as any).questions || [];
                        const existingIds = existingQuestions.map((q: any) => q.id);
                        const inputIds = finalTest.questions.filter((q: any) => q.id).map((q: any) => q.id);

                        // Delete missing questions
                        const toDelete = existingIds.filter((id: string) => !inputIds.includes(id));
                        if (toDelete.length > 0) {
                            await tx.lmsTestQuestion.deleteMany({
                                where: { id: { in: toDelete } }
                            });
                        }

                        // Create/Update questions
                        for (const q of finalTest.questions) {
                            const qData = {
                                questionText: q.questionText,
                                explanation: q.explanation,
                                order: q.order,
                                points: q.points,
                                isActive: q.isActive,
                            };

                            if (q.id && existingIds.includes(q.id)) {
                                await tx.lmsTestQuestion.update({
                                    where: { id: q.id },
                                    data: qData
                                });

                                // Smarter Option Update
                                const inputOptions = q.options || [];
                                const existingOptions = await tx.lmsTestOption.findMany({ where: { questionId: q.id } });
                                const existingOptionIds = existingOptions.map(o => o.id);
                                const inputOptionIds = inputOptions.filter((o: any) => o.id).map((o: any) => o.id);

                                // Delete removed options
                                const optionsToDelete = existingOptionIds.filter(id => !inputOptionIds.includes(id));
                                if (optionsToDelete.length > 0) {
                                    await tx.lmsTestOption.deleteMany({ where: { id: { in: optionsToDelete } } });
                                }

                                // Update/Create options
                                for (const opt of inputOptions) {
                                    const optData = {
                                        text: opt.text,
                                        isCorrect: opt.isCorrect,
                                        order: opt.order
                                    };
                                    if (opt.id && existingOptionIds.includes(opt.id)) {
                                        await tx.lmsTestOption.update({
                                            where: { id: opt.id },
                                            data: optData
                                        });
                                    } else {
                                        await tx.lmsTestOption.create({
                                            data: {
                                                ...optData,
                                                questionId: q.id
                                            }
                                        });
                                    }
                                }
                            } else {
                                await tx.lmsTestQuestion.create({
                                    data: {
                                        ...qData,
                                        finalTestId: course.finalTest.id,
                                        options: {
                                            create: q.options?.map(o => ({
                                                text: o.text,
                                                isCorrect: o.isCorrect,
                                                order: o.order
                                            }))
                                        }
                                    }
                                });
                            }
                        }
                    }

                } else {
                    const { questions, ...testData } = finalTest as any;
                    await tx.lmsFinalTest.create({
                        data: {
                            ...testData,
                            courseId: id,
                            totalPoints: finalTestPoints,
                            questions: questions ? {
                                create: questions.map((q: any) => ({
                                    questionText: q.questionText,
                                    explanation: q.explanation,
                                    order: q.order,
                                    points: q.points || 1,
                                    isActive: q.isActive !== false,
                                    options: {
                                        create: q.options?.map((o: any) => ({
                                            text: o.text,
                                            isCorrect: o.isCorrect,
                                            order: o.order
                                        }))
                                    }
                                }))
                            } : undefined
                        }
                    });
                }
            }

            // Handle Modules and Topics
            if (modules) {
                // Get existing modules to know what to delete/update
                const existingModules = course.modules;
                const existingModuleIds = existingModules.map(m => m.id);
                const inputModuleIds = modules.map(m => (m as any).id).filter(Boolean);

                // Modules to delete
                const modulesToDelete = existingModuleIds.filter(mid => !inputModuleIds.includes(mid));
                if (modulesToDelete.length > 0) {
                    // Cascade delete for topics and tests is handled by Prisma/DB if configured, 
                    // otherwise we should be careful. Assuming Prisma handle it or we do it explicitly.
                    // For safety, let's just delete the module.
                    await tx.lmsModule.deleteMany({
                        where: { id: { in: modulesToDelete } }
                    });
                }

                // Create or Update modules
                for (const m of modules) {
                    const moduleData: any = {
                        title: m.title,
                        shortDescription: m.shortDescription || '',
                        description: m.description || null,
                        order: m.order,
                        points: m.points,
                        estimatedMinutes: m.estimatedMinutes,
                        isActive: m.isActive,
                        totalTopics: m.topics?.length || 0,
                    };

                    let moduleId: string;
                    const existingModule = (m as any).id ? existingModules.find(em => em.id === (m as any).id) : null;

                    if (existingModule) {
                        moduleId = existingModule.id;
                        await tx.lmsModule.update({
                            where: { id: moduleId },
                            data: moduleData
                        });
                    } else {
                        const newModule = await tx.lmsModule.create({
                            data: {
                                ...moduleData,
                                courseId: id
                            }
                        });
                        moduleId = newModule.id;
                    }

                    // Handle Module Test
                    if (m.moduleTest) {
                        const testPoints = m.moduleTest.totalQuestions * (m.moduleTest.pointsPerQuestion || 10);
                        let existingTest = existingModule ? await tx.lmsModuleTest.findUnique({
                            where: { moduleId },
                            include: { questions: { include: { options: true } } }
                        }) : null;

                        if (existingTest) {
                            await tx.lmsModuleTest.update({
                                where: { id: existingTest.id },
                                data: { ...(m.moduleTest as any), totalPoints: testPoints, questions: undefined }
                            });

                            // Update Questions logic (duplicated from finalTest, could be refactored)
                            if (m.moduleTest.questions) {
                                const existingQuestions = existingTest.questions || [];
                                const existingIds = existingQuestions.map((q: any) => q.id);
                                const inputIds = m.moduleTest.questions.filter((q: any) => q.id).map((q: any) => q.id);

                                // Delete missing questions
                                const toDelete = existingIds.filter((id: string) => !inputIds.includes(id));
                                if (toDelete.length > 0) {
                                    await tx.lmsTestQuestion.deleteMany({
                                        where: { id: { in: toDelete } }
                                    });
                                }

                                // Create/Update questions
                                for (const q of m.moduleTest.questions) {
                                    const qData = {
                                        questionText: q.questionText,
                                        explanation: q.explanation,
                                        order: q.order,
                                        points: q.points,
                                        isActive: q.isActive,
                                    };

                                    if (q.id && existingIds.includes(q.id)) {
                                        await tx.lmsTestQuestion.update({
                                            where: { id: q.id },
                                            data: qData
                                        });

                                        // Smarter Option Update (duplicated logic)
                                        const inputOptions = q.options || [];
                                        const existingOptions = await tx.lmsTestOption.findMany({ where: { questionId: q.id } });
                                        const existingOptionIds = existingOptions.map(o => o.id);
                                        const inputOptionIds = inputOptions.filter((o: any) => o.id).map((o: any) => o.id);

                                        // Delete removed options
                                        const optionsToDelete = existingOptionIds.filter(id => !inputOptionIds.includes(id));
                                        if (optionsToDelete.length > 0) {
                                            await tx.lmsTestOption.deleteMany({ where: { id: { in: optionsToDelete } } });
                                        }

                                        // Update/Create options
                                        for (const opt of inputOptions) {
                                            const optData = {
                                                text: opt.text,
                                                isCorrect: opt.isCorrect,
                                                order: opt.order
                                            };
                                            if (opt.id && existingOptionIds.includes(opt.id)) {
                                                await tx.lmsTestOption.update({
                                                    where: { id: opt.id },
                                                    data: optData
                                                });
                                            } else {
                                                await tx.lmsTestOption.create({
                                                    data: {
                                                        ...optData,
                                                        questionId: q.id
                                                    }
                                                });
                                            }
                                        }
                                    } else {
                                        await tx.lmsTestQuestion.create({
                                            data: {
                                                ...qData,
                                                moduleTestId: existingTest.id,
                                                options: {
                                                    create: q.options?.map((o: any) => ({
                                                        text: o.text,
                                                        isCorrect: o.isCorrect,
                                                        order: o.order
                                                    }))
                                                }
                                            }
                                        });
                                    }
                                }
                            }

                        } else {
                            const { questions, ...testData } = m.moduleTest as any;
                            await tx.lmsModuleTest.create({
                                data: {
                                    ...testData,
                                    moduleId,
                                    totalPoints: testPoints,
                                    questions: questions ? {
                                        create: questions.map((q: any) => ({
                                            questionText: q.questionText,
                                            explanation: q.explanation,
                                            order: q.order,
                                            points: q.points || 1,
                                            isActive: q.isActive !== false,
                                            options: {
                                                create: q.options?.map((o: any) => ({
                                                    text: o.text,
                                                    isCorrect: o.isCorrect,
                                                    order: o.order
                                                }))
                                            }
                                        }))
                                    } : undefined
                                }
                            });
                        }
                    } else if (existingModule) {
                        await tx.lmsModuleTest.deleteMany({ where: { moduleId } });
                    }

                    // Handle Topics
                    if (m.topics) {
                        const existingTopics = existingModule?.topics || [];
                        const existingTopicIds = existingTopics.map(t => t.id);
                        const inputTopicIds = m.topics.map(t => (t as any).id).filter(Boolean);

                        // Topics to delete
                        const topicsToDelete = existingTopicIds.filter(tid => !inputTopicIds.includes(tid));
                        if (topicsToDelete.length > 0) {
                            await tx.lmsTopic.deleteMany({
                                where: { id: { in: topicsToDelete } }
                            });
                        }

                        // Create or Update topics
                        for (const t of m.topics) {
                            const topicData = {
                                title: t.title,
                                description: t.description || null,
                                order: t.order,
                                theoryContent: t.theoryContent || '',
                                videoUrl: t.videoUrl || null,
                                videoDuration: t.videoDuration || null,
                                estimatedMinutes: t.estimatedMinutes,
                                isActive: t.isActive,
                                resources: t.resources || []
                            };

                            const existingTopic = (t as any).id ? existingTopics.find(et => et.id === (t as any).id) : null;

                            if (existingTopic) {
                                await tx.lmsTopic.update({
                                    where: { id: existingTopic.id },
                                    data: topicData
                                });
                            } else {
                                await tx.lmsTopic.create({
                                    data: {
                                        ...topicData,
                                        moduleId
                                    }
                                });
                            }
                        }
                    }
                }
            }

            return updated;
        });

        // Sync stats after transaction is committed
        await this.syncCourseStats(id);

        return this.findOne(id);
    }

    async delete(id: string) {
        await this.findOne(id);
        return prisma.lmsCourse.delete({
            where: { id },
        });
    }

    async getEnrollments(courseId: string) {
        const enrollments = await prisma.lmsEnrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        const total = enrollments.length;
        const inProgress = enrollments.filter(e => e.status === 'ACTIVE').length;
        const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
        const dropped = enrollments.filter(e => e.status === 'DROPPED').length;

        const totalProgress = enrollments.reduce((sum, e) => sum + e.progressPercent, 0);
        const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
            enrollments: enrollments.map(e => ({
                id: e.id,
                userId: e.userId,
                user: e.user,
                status: e.status === 'ACTIVE' ? 'IN_PROGRESS' : e.status,
                progress: e.progressPercent,
                enrolledAt: e.enrolledAt,
                completedAt: e.completedAt,
                lastAccessedAt: e.lastAccessedAt
            })),
            stats: {
                total,
                inProgress,
                completed,
                dropped,
                averageProgress,
                completionRate
            }
        };
    }
}

export const courseService = new CourseService();