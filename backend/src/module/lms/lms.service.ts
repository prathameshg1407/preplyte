// src/module/lms/lms.service.ts

import { prisma } from '../../lib/db';
import {
  LmsCourseStatus,
  LmsEnrollmentStatus,
  LmsModuleStatus,
  LmsTopicStatus,
  LmsTestType,
  LmsTestAttemptStatus,
  Prisma,
} from '@prisma/client';
import { AppError } from '../../utils/errors';
import { LMS_CONSTANTS, LMS_ERROR_MESSAGES } from './lms.constants';
import type {
  GetCoursesQuery,
  UpdateTopicProgressBody,
  SubmitTestBody,
  CategoryResponse,
  CoursesListResponse,
  CourseDetailsResponse,
  ModuleDetailsResponse,
  TopicDetailsResponse,
  EnrollmentResponse,
  ModuleProgressResponse,
  TopicProgressResponse,
  StartTestResponse,
  SubmitTestResponse,
  LmsStatsResponse,
  UserDashboardResponse,
  CourseCardResponse,
} from './lms.types';

class LmsService {
  // =====================================================
  // CATEGORIES
  // =====================================================

  async getCategories(): Promise<CategoryResponse[]> {
    const categories = await prisma.lmsCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            courses: {
              where: {
                status: LmsCourseStatus.PUBLISHED,
                isActive: true,
              },
            },
          },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      iconUrl: cat.iconUrl,
      order: cat.order,
      isActive: cat.isActive,
      coursesCount: cat._count.courses,
    }));
  }

  // =====================================================
  // STATS
  // =====================================================

  async getStats(): Promise<LmsStatsResponse> {
    const [coursesCount, instructorsCount, studentsCount, completionStats] = await Promise.all([
      prisma.lmsCourse.count({
        where: { status: LmsCourseStatus.PUBLISHED, isActive: true },
      }),
      prisma.lmsCourse.findMany({
        where: { status: LmsCourseStatus.PUBLISHED, isActive: true },
        select: { instructor: true },
        distinct: ['instructor'],
      }),
      prisma.lmsEnrollment.groupBy({
        by: ['userId'],
        _count: true,
      }),
      prisma.lmsEnrollment.aggregate({
        _avg: { progressPercent: true },
        where: { status: LmsEnrollmentStatus.COMPLETED },
      }),
    ]);

    return {
      totalCourses: coursesCount,
      totalInstructors: instructorsCount.filter((i) => i.instructor).length,
      totalStudents: studentsCount.length,
      averageCompletionRate: Math.round(completionStats._avg.progressPercent || 0),
    };
  }

  // =====================================================
  // COURSES
  // =====================================================

  async getCourses(query: GetCoursesQuery, userId?: string): Promise<CoursesListResponse> {
    const {
      page: pageRaw = 1,
      limit: limitRaw = LMS_CONSTANTS.DEFAULT_PAGE_SIZE,
      categorySlug,
      difficulty,
      search,
      sortBy = 'popular',
      priceRange = 'all',
    } = query;

    // Convert parameters to numbers (handling potential strings from query params)
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.min(
      LMS_CONSTANTS.MAX_PAGE_SIZE,
      Math.max(1, Number(limitRaw) || LMS_CONSTANTS.DEFAULT_PAGE_SIZE)
    );

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.LmsCourseWhereInput = {
      status: LmsCourseStatus.PUBLISHED,
      isActive: true,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (priceRange === 'free') {
      where.price = 0;
    } else if (priceRange === 'paid') {
      where.price = { gt: 0 };
    }

    // Build orderBy
    let orderBy: Prisma.LmsCourseOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = { enrollments: { _count: 'desc' } };
        break;
    }

    // Get user's enrollments if logged in
    let userEnrollments: Map<string, number> = new Map();
    if (userId) {
      const enrollments = await prisma.lmsEnrollment.findMany({
        where: { userId },
        select: { courseId: true, progressPercent: true },
      });
      userEnrollments = new Map(enrollments.map((e) => [e.courseId, e.progressPercent]));
    }

    const [courses, total] = await Promise.all([
      prisma.lmsCourse.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.lmsCourse.count({ where }),
    ]);

    const courseCards: CourseCardResponse[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      totalModules: course.totalModules,
      totalPoints: course.totalPoints,
      totalHours: course.totalHours,
      price: course.price,
      discountPrice: course.discountPrice,
      currency: course.currency,
      difficulty: course.difficulty,
      instructor: course.instructor,
      category: course.category,
      isEnrolled: userEnrollments.has(course.id),
      enrollmentProgress: userEnrollments.get(course.id),
    }));

    return {
      courses: courseCards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCourseBySlug(slug: string, userId?: string): Promise<CourseDetailsResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug },
      include: {
        category: true,
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            topics: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                order: true,
                estimatedMinutes: true,
                videoUrl: true,
              },
            },
            moduleTest: {
              select: {
                id: true,
                title: true,
                instructions: true,
                totalQuestions: true,
                timeLimitMinutes: true,
                passingScore: true,
                maxAttempts: true,
                pointsPerQuestion: true,
                totalPoints: true,
                isActive: true,
              },
            },
          },
        },
        finalTest: true,
      },
    });

    if (!course || course.status !== LmsCourseStatus.PUBLISHED) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    // Get enrollment and progress if user is logged in
    let enrollment: EnrollmentResponse | null = null;
    let moduleProgressMap: Map<string, ModuleProgressResponse> = new Map();
    let topicProgressMap: Map<string, TopicProgressResponse> = new Map();

    if (userId) {
      const userEnrollment = await prisma.lmsEnrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId: course.id },
        },
      });

      if (userEnrollment) {
        enrollment = userEnrollment as EnrollmentResponse;

        // Get module progress
        const moduleProgress = await prisma.lmsModuleProgress.findMany({
          where: {
            userId,
            moduleId: { in: course.modules.map((m) => m.id) },
          },
        });
        moduleProgressMap = new Map(moduleProgress.map((p) => [p.moduleId, p as ModuleProgressResponse]));

        // Get topic progress
        const allTopicIds = course.modules.flatMap((m) => m.topics.map((t) => t.id));
        const topicProgress = await prisma.lmsTopicProgress.findMany({
          where: {
            userId,
            topicId: { in: allTopicIds },
          },
        });
        topicProgressMap = new Map(topicProgress.map((p) => [p.topicId, p as TopicProgressResponse]));
      }
    }

    // Format modules with progress
    const modules = course.modules.map((module) => ({
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      shortDescription: module.shortDescription,
      description: module.description,
      order: module.order,
      totalTopics: module.totalTopics,
      points: module.points,
      estimatedMinutes: module.estimatedMinutes,
      isActive: module.isActive,
      topics: module.topics.map((topic) => ({
        id: topic.id,
        moduleId: module.id,
        title: topic.title,
        description: null,
        order: topic.order,
        theoryContent: '',
        videoUrl: topic.videoUrl,
        videoDuration: null,
        estimatedMinutes: topic.estimatedMinutes,
        resources: null,
        isActive: true,
        progress: topicProgressMap.get(topic.id) || null,
      })),
      moduleTest: module.moduleTest
        ? {
          id: module.moduleTest.id,
          moduleId: module.id,
          title: module.moduleTest.title,
          instructions: module.moduleTest.instructions || '',
          totalQuestions: module.moduleTest.totalQuestions,
          timeLimitMinutes: module.moduleTest.timeLimitMinutes,
          passingScore: module.moduleTest.passingScore,
          maxAttempts: module.moduleTest.maxAttempts,
          pointsPerQuestion: module.moduleTest.pointsPerQuestion,
          totalPoints: module.moduleTest.totalPoints,
          isActive: module.moduleTest.isActive,
        }
        : null,
      progress: moduleProgressMap.get(module.id) || null,
    }));

    return {
      course: {
        ...course,
        category: {
          id: course.category.id,
          name: course.category.name,
          slug: course.category.slug,
          description: course.category.description,
          iconUrl: course.category.iconUrl,
          order: course.category.order,
          isActive: course.category.isActive,
          coursesCount: 0,
        },
      },
      modules,
      enrollment,
      finalTest: course.finalTest,
    };
  }

  // =====================================================
  // ENROLLMENT
  // =====================================================

  async enrollCourse(courseSlug: string, userId: string): Promise<{ enrollment: EnrollmentResponse; message: string }> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            topics: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course || course.status !== LmsCourseStatus.PUBLISHED) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.lmsEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });

    if (existingEnrollment) {
      throw new AppError('ALREADY_ENROLLED', LMS_ERROR_MESSAGES.ALREADY_ENROLLED, 400);
    }

    // Create enrollment and initialize progress in a transaction
    const enrollment = await prisma.$transaction(async (tx) => {
      // Create enrollment
      const newEnrollment = await tx.lmsEnrollment.create({
        data: {
          userId,
          courseId: course.id,
          status: LmsEnrollmentStatus.ACTIVE,
          enrolledAt: new Date(),
        },
      });

      // Initialize module progress for all modules
      const moduleProgressData = course.modules.map((module, index) => ({
        userId,
        moduleId: module.id,
        status: index === 0 ? LmsModuleStatus.AVAILABLE : LmsModuleStatus.LOCKED,
        totalTopics: module.topics.length,
      }));

      await tx.lmsModuleProgress.createMany({
        data: moduleProgressData,
      });

      // Initialize topic progress for the first module
      if (course.modules.length > 0) {
        const firstModuleTopics = course.modules[0].topics;
        const topicProgressData = firstModuleTopics.map((topic, index) => ({
          userId,
          topicId: topic.id,
          status: index === 0 ? LmsTopicStatus.NOT_STARTED : LmsTopicStatus.NOT_STARTED,
        }));

        await tx.lmsTopicProgress.createMany({
          data: topicProgressData,
        });
      }

      return newEnrollment;
    });

    return {
      enrollment: enrollment as EnrollmentResponse,
      message: 'Successfully enrolled in the course',
    };
  }

  // =====================================================
  // MODULE DETAILS
  // =====================================================

  async getModuleDetails(
    courseSlug: string,
    moduleOrder: number,
    userId: string
  ): Promise<ModuleDetailsResponse> {
    // Verify enrollment
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      select: { id: true, title: true, slug: true },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    const enrollment = await prisma.lmsEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });

    if (!enrollment) {
      throw new AppError('NOT_ENROLLED', LMS_ERROR_MESSAGES.NOT_ENROLLED, 403);
    }

    // Get module with topics
    const module = await prisma.lmsModule.findFirst({
      where: {
        courseId: course.id,
        order: moduleOrder,
        isActive: true,
      },
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        moduleTest: true,
      },
    });

    if (!module) {
      throw new AppError('MODULE_NOT_FOUND', LMS_ERROR_MESSAGES.MODULE_NOT_FOUND, 404);
    }

    // Get module progress
    const moduleProgress = await prisma.lmsModuleProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId: module.id },
      },
    });

    // Check if module is accessible
    if (moduleProgress?.status === LmsModuleStatus.LOCKED) {
      throw new AppError('MODULE_LOCKED', LMS_ERROR_MESSAGES.MODULE_LOCKED, 403);
    }

    // Get topic progress
    const topicProgress = await prisma.lmsTopicProgress.findMany({
      where: {
        userId,
        topicId: { in: module.topics.map((t) => t.id) },
      },
    });
    const topicProgressMap = new Map(topicProgress.map((p) => [p.topicId, p]));

    // Format topics with progress
    const topics = module.topics.map((topic) => ({
      id: topic.id,
      moduleId: topic.moduleId,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      theoryContent: topic.theoryContent,
      videoUrl: topic.videoUrl,
      videoDuration: topic.videoDuration,
      estimatedMinutes: topic.estimatedMinutes,
      resources: topic.resources as any,
      isActive: topic.isActive,
      progress: (topicProgressMap.get(topic.id) as TopicProgressResponse) || null,
    }));

    // Format moduleTest with all required properties
    const formattedModuleTest = module.moduleTest
      ? {
        id: module.moduleTest.id,
        moduleId: module.id,
        title: module.moduleTest.title,
        instructions: module.moduleTest.instructions || '',
        totalQuestions: module.moduleTest.totalQuestions,
        timeLimitMinutes: module.moduleTest.timeLimitMinutes,
        passingScore: module.moduleTest.passingScore,
        maxAttempts: module.moduleTest.maxAttempts,
        pointsPerQuestion: module.moduleTest.pointsPerQuestion,
        totalPoints: module.moduleTest.totalPoints,
        isActive: module.moduleTest.isActive,
      }
      : null;

    return {
      module: {
        id: module.id,
        courseId: module.courseId,
        title: module.title,
        shortDescription: module.shortDescription,
        description: module.description,
        order: module.order,
        totalTopics: module.totalTopics,
        points: module.points,
        estimatedMinutes: module.estimatedMinutes,
        isActive: module.isActive,
      },
      topics,
      moduleTest: formattedModuleTest,
      progress: moduleProgress as ModuleProgressResponse,
      courseTitle: course.title,
      courseSlug: course.slug,
    };
  }

  // =====================================================
  // TOPIC DETAILS
  // =====================================================

  async getTopicDetails(
    courseSlug: string,
    moduleOrder: number,
    topicOrder: number,
    userId: string
  ): Promise<TopicDetailsResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      select: { id: true, title: true, slug: true },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    // Verify enrollment
    const enrollment = await prisma.lmsEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });

    if (!enrollment) {
      throw new AppError('NOT_ENROLLED', LMS_ERROR_MESSAGES.NOT_ENROLLED, 403);
    }

    // Get module
    const module = await prisma.lmsModule.findFirst({
      where: {
        courseId: course.id,
        order: moduleOrder,
        isActive: true,
      },
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!module) {
      throw new AppError('MODULE_NOT_FOUND', LMS_ERROR_MESSAGES.MODULE_NOT_FOUND, 404);
    }

    // Get topic
    const topic = module.topics.find((t) => t.order === topicOrder);

    if (!topic) {
      throw new AppError('TOPIC_NOT_FOUND', LMS_ERROR_MESSAGES.TOPIC_NOT_FOUND, 404);
    }

    // Get topic progress
    let topicProgress = await prisma.lmsTopicProgress.findUnique({
      where: {
        userId_topicId: { userId, topicId: topic.id },
      },
    });

    // Create progress if not exists
    if (!topicProgress) {
      topicProgress = await prisma.lmsTopicProgress.create({
        data: {
          userId,
          topicId: topic.id,
          status: LmsTopicStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
    } else if (topicProgress.status === LmsTopicStatus.NOT_STARTED) {
      topicProgress = await prisma.lmsTopicProgress.update({
        where: { id: topicProgress.id },
        data: {
          status: LmsTopicStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
    }

    // Update last accessed
    await prisma.lmsEnrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() },
    });

    // Get prev/next topics
    const prevTopic = module.topics.find((t) => t.order === topicOrder - 1);
    const nextTopic = module.topics.find((t) => t.order === topicOrder + 1);

    return {
      topic: {
        id: topic.id,
        moduleId: topic.moduleId,
        title: topic.title,
        description: topic.description,
        order: topic.order,
        theoryContent: topic.theoryContent,
        videoUrl: topic.videoUrl,
        videoDuration: topic.videoDuration,
        estimatedMinutes: topic.estimatedMinutes,
        resources: topic.resources as any,
        isActive: topic.isActive,
        progress: topicProgress as TopicProgressResponse,
      },
      progress: topicProgress as TopicProgressResponse,
      prevTopic: prevTopic ? { id: prevTopic.id, title: prevTopic.title, order: prevTopic.order } : null,
      nextTopic: nextTopic ? { id: nextTopic.id, title: nextTopic.title, order: nextTopic.order } : null,
      moduleTitle: module.title,
      courseTitle: course.title,
      courseSlug: course.slug,
      moduleOrder: module.order,
    };
  }

  // =====================================================
  // UPDATE TOPIC PROGRESS
  // =====================================================

  async updateTopicProgress(
    courseSlug: string,
    moduleOrder: number,
    topicOrder: number,
    userId: string,
    data: UpdateTopicProgressBody
  ): Promise<TopicProgressResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    const module = await prisma.lmsModule.findFirst({
      where: { courseId: course.id, order: moduleOrder },
      include: {
        topics: { orderBy: { order: 'asc' } },
      },
    });

    if (!module) {
      throw new AppError('MODULE_NOT_FOUND', LMS_ERROR_MESSAGES.MODULE_NOT_FOUND, 404);
    }

    const topic = module.topics.find((t) => t.order === topicOrder);

    if (!topic) {
      throw new AppError('TOPIC_NOT_FOUND', LMS_ERROR_MESSAGES.TOPIC_NOT_FOUND, 404);
    }

    // Update topic progress
    const updateData: any = {};

    if (data.theoryCompleted !== undefined) {
      updateData.theoryCompleted = data.theoryCompleted;
    }
    if (data.videoWatched !== undefined) {
      updateData.videoWatched = data.videoWatched;
    }
    if (data.videoProgress !== undefined) {
      updateData.videoProgress = data.videoProgress;
    }
    if (data.timeSpentMinutes !== undefined) {
      updateData.timeSpentMinutes = { increment: data.timeSpentMinutes };
    }

    let topicProgress = await prisma.lmsTopicProgress.upsert({
      where: {
        userId_topicId: { userId, topicId: topic.id },
      },
      create: {
        userId,
        topicId: topic.id,
        status: LmsTopicStatus.IN_PROGRESS,
        ...data,
        startedAt: new Date(),
      },
      update: updateData,
    });

    // Check if topic is completed
    const isTopicComplete = this.checkTopicCompletion(topicProgress, topic.videoUrl);

    if (isTopicComplete && topicProgress.status !== LmsTopicStatus.COMPLETED) {
      topicProgress = await prisma.lmsTopicProgress.update({
        where: { id: topicProgress.id },
        data: {
          status: LmsTopicStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Update module progress
      await this.updateModuleProgress(userId, module.id);
    }

    return topicProgress as TopicProgressResponse;
  }

  private checkTopicCompletion(progress: any, hasVideo: string | null): boolean {
    if (hasVideo) {
      return progress.theoryCompleted && progress.videoWatched;
    }
    return progress.theoryCompleted;
  }

  private async updateModuleProgress(userId: string, moduleId: string): Promise<void> {
    const module = await prisma.lmsModule.findUnique({
      where: { id: moduleId },
      include: {
        topics: { where: { isActive: true } },
        course: { select: { id: true } },
      },
    });

    if (!module) return;

    // Count completed topics
    const completedTopics = await prisma.lmsTopicProgress.count({
      where: {
        userId,
        topicId: { in: module.topics.map((t) => t.id) },
        status: LmsTopicStatus.COMPLETED,
      },
    });

    const progressPercent = (completedTopics / module.topics.length) * 100;

    // Update module progress
    await prisma.lmsModuleProgress.update({
      where: {
        userId_moduleId: { userId, moduleId },
      },
      data: {
        completedTopics,
        progressPercent,
        status: completedTopics === module.topics.length ? LmsModuleStatus.COMPLETED : LmsModuleStatus.IN_PROGRESS,
      },
    });

    // Update enrollment progress
    await this.updateEnrollmentProgress(userId, module.course.id);
  }

  private async updateEnrollmentProgress(userId: string, courseId: string): Promise<void> {
    const course = await prisma.lmsCourse.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          where: { isActive: true },
          include: {
            topics: { where: { isActive: true } },
          },
        },
      },
    });

    if (!course) return;

    const totalTopics = course.modules.reduce((sum, m) => sum + m.topics.length, 0);

    const completedTopics = await prisma.lmsTopicProgress.count({
      where: {
        userId,
        topicId: {
          in: course.modules.flatMap((m) => m.topics.map((t) => t.id)),
        },
        status: LmsTopicStatus.COMPLETED,
      },
    });

    const completedModules = await prisma.lmsModuleProgress.count({
      where: {
        userId,
        moduleId: { in: course.modules.map((m) => m.id) },
        status: LmsModuleStatus.COMPLETED,
      },
    });

    const progressPercent = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    await prisma.lmsEnrollment.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        completedTopics,
        completedModules,
        progressPercent,
        startedAt: { set: new Date() },
      },
    });
  }

  // =====================================================
  // MODULE TEST
  // =====================================================

  async startModuleTest(
    courseSlug: string,
    moduleOrder: number,
    userId: string
  ): Promise<StartTestResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    const module = await prisma.lmsModule.findFirst({
      where: { courseId: course.id, order: moduleOrder },
      include: {
        moduleTest: {
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                options: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!module || !module.moduleTest) {
      throw new AppError('TEST_NOT_AVAILABLE', LMS_ERROR_MESSAGES.TEST_NOT_AVAILABLE, 404);
    }

    const moduleTest = module.moduleTest;

    // Check module progress
    const moduleProgress = await prisma.lmsModuleProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId: module.id },
      },
    });

    if (!moduleProgress) {
      throw new AppError('NOT_ENROLLED', LMS_ERROR_MESSAGES.NOT_ENROLLED, 403);
    }

    // Check if already passed
    if (moduleProgress.testPassed) {
      throw new AppError('TEST_ALREADY_PASSED', LMS_ERROR_MESSAGES.TEST_ALREADY_PASSED, 400);
    }

    // Check max attempts
    if (moduleProgress.testAttempts >= moduleTest.maxAttempts && moduleTest.maxAttempts > 0) {
      throw new AppError('TEST_MAX_ATTEMPTS', LMS_ERROR_MESSAGES.TEST_MAX_ATTEMPTS, 400);
    }

    // Check if there's an in-progress attempt
    const existingAttempt = await prisma.lmsTestAttempt.findFirst({
      where: {
        userId,
        moduleTestId: moduleTest.id,
        status: LmsTestAttemptStatus.IN_PROGRESS,
      },
    });

    if (existingAttempt) {
      // Return existing attempt if not expired
      const now = new Date();
      if (existingAttempt.expiresAt && existingAttempt.expiresAt > now) {
        const questions = moduleTest.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          order: q.order,
          points: q.points,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            order: o.order,
          })),
        }));

        return {
          attempt: {
            id: existingAttempt.id,
            testType: LmsTestType.MODULE_TEST,
            status: existingAttempt.status,
            attemptNumber: existingAttempt.attemptNumber,
            totalQuestions: existingAttempt.totalQuestions,
            timeLimitMinutes: existingAttempt.timeLimitMinutes,
            startedAt: existingAttempt.startedAt,
            expiresAt: existingAttempt.expiresAt!,
          },
          questions,
        };
      }
    }

    // Create new attempt
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + moduleTest.timeLimitMinutes * 60 * 1000);

    const attempt = await prisma.lmsTestAttempt.create({
      data: {
        userId,
        moduleTestId: moduleTest.id,
        testType: LmsTestType.MODULE_TEST,
        status: LmsTestAttemptStatus.IN_PROGRESS,
        attemptNumber: moduleProgress.testAttempts + 1,
        totalQuestions: moduleTest.questions.length,
        timeLimitMinutes: moduleTest.timeLimitMinutes,
        totalMarks: moduleTest.totalPoints,
        startedAt,
        expiresAt,
      },
    });

    // Update module progress attempt count
    await prisma.lmsModuleProgress.update({
      where: { id: moduleProgress.id },
      data: { testAttempts: { increment: 1 } },
    });

    const questions = moduleTest.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      order: q.order,
      points: q.points,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        order: o.order,
      })),
    }));

    return {
      attempt: {
        id: attempt.id,
        testType: LmsTestType.MODULE_TEST,
        status: attempt.status,
        attemptNumber: attempt.attemptNumber,
        totalQuestions: attempt.totalQuestions,
        timeLimitMinutes: attempt.timeLimitMinutes,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt!,
      },
      questions,
    };
  }

  async submitModuleTest(
    courseSlug: string,
    moduleOrder: number,
    userId: string,
    data: SubmitTestBody
  ): Promise<SubmitTestResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', LMS_ERROR_MESSAGES.COURSE_NOT_FOUND, 404);
    }

    const module = await prisma.lmsModule.findFirst({
      where: { courseId: course.id, order: moduleOrder },
      include: {
        moduleTest: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!module || !module.moduleTest) {
      throw new AppError('TEST_NOT_AVAILABLE', LMS_ERROR_MESSAGES.TEST_NOT_AVAILABLE, 404);
    }

    const moduleTest = module.moduleTest;

    // Get the in-progress attempt
    const attempt = await prisma.lmsTestAttempt.findFirst({
      where: {
        userId,
        moduleTestId: moduleTest.id,
        status: LmsTestAttemptStatus.IN_PROGRESS,
      },
    });

    if (!attempt) {
      throw new AppError('INVALID_ATTEMPT', LMS_ERROR_MESSAGES.INVALID_ATTEMPT, 400);
    }

    // Calculate results
    const answerMap = new Map(data.answers.map((a) => [a.questionId, a.selectedOptionId]));
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let pointsEarned = 0;

    const responses: any[] = [];

    for (const question of moduleTest.questions) {
      const selectedOptionId = answerMap.get(question.id);
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (selectedOptionId) {
        if (isCorrect) {
          correctAnswers++;
          pointsEarned += question.points;
        } else {
          wrongAnswers++;
        }
      }

      responses.push({
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId,
        isCorrect: selectedOptionId ? isCorrect : null,
        pointsAwarded: isCorrect ? question.points : 0,
        answeredAt: selectedOptionId ? new Date() : null,
      });
    }

    const unanswered = moduleTest.questions.length - correctAnswers - wrongAnswers;
    const score = (correctAnswers / moduleTest.questions.length) * 100;
    const isPassed = score >= moduleTest.passingScore;
    const timeSpentSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Save responses and update attempt
    await prisma.$transaction(async (tx) => {
      // Create responses
      await tx.lmsTestResponse.createMany({ data: responses });

      // Update attempt
      await tx.lmsTestAttempt.update({
        where: { id: attempt.id },
        data: {
          status: LmsTestAttemptStatus.COMPLETED,
          correctAnswers,
          wrongAnswers,
          unanswered,
          score,
          pointsEarned,
          marksObtained: pointsEarned,
          isPassed,
          timeSpentSeconds,
          completedAt: new Date(),
        },
      });

      // Update module progress
      const moduleProgress = await tx.lmsModuleProgress.findUnique({
        where: {
          userId_moduleId: { userId, moduleId: module.id },
        },
      });

      if (moduleProgress) {
        const updateData: any = {
          testAttempted: true,
        };

        if (isPassed && !moduleProgress.testPassed) {
          updateData.testPassed = true;
          updateData.testScore = score;
          updateData.pointsEarned = pointsEarned;
          updateData.status = LmsModuleStatus.COMPLETED;
          updateData.completedAt = new Date();
        } else if (!moduleProgress.testPassed && score > (moduleProgress.testScore || 0)) {
          updateData.testScore = score;
        }

        await tx.lmsModuleProgress.update({
          where: { id: moduleProgress.id },
          data: updateData,
        });

        // If module completed, unlock next module
        if (isPassed) {
          const nextModule = await tx.lmsModule.findFirst({
            where: {
              courseId: course.id,
              order: moduleOrder + 1,
              isActive: true,
            },
          });

          if (nextModule) {
            await tx.lmsModuleProgress.upsert({
              where: {
                userId_moduleId: { userId, moduleId: nextModule.id },
              },
              create: {
                userId,
                moduleId: nextModule.id,
                status: LmsModuleStatus.AVAILABLE,
                totalTopics: nextModule.totalTopics,
              },
              update: {
                status: LmsModuleStatus.AVAILABLE,
              },
            });
          }

          // Update enrollment points
          await tx.lmsEnrollment.update({
            where: {
              userId_courseId: { userId, courseId: course.id },
            },
            data: {
              moduleTestPointsEarned: { increment: pointsEarned },
              totalPointsEarned: { increment: pointsEarned },
              completedModules: { increment: 1 },
            },
          });
        }
      }
    });

    return {
      attempt: {
        id: attempt.id,
        testType: LmsTestType.MODULE_TEST,
        status: LmsTestAttemptStatus.COMPLETED,
        totalQuestions: moduleTest.questions.length,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        pointsEarned,
        marksObtained: pointsEarned,
        totalMarks: moduleTest.totalPoints,
        isPassed,
        timeSpentSeconds,
        completedAt: new Date(),
      },
      pointsEarned,
      passed: isPassed,
      message: isPassed
        ? 'Congratulations! You passed the module test.'
        : 'You did not pass. Review the material and try again.',
    };
  }

  // =====================================================
  // FINAL TEST
  // =====================================================

  async startFinalTest(courseSlug: string, userId: string): Promise<StartTestResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      include: {
        finalTest: {
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                options: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
        modules: { where: { isActive: true } },
      },
    });

    if (!course || !course.finalTest) {
      throw new AppError('TEST_NOT_AVAILABLE', LMS_ERROR_MESSAGES.TEST_NOT_AVAILABLE, 404);
    }

    const finalTest = course.finalTest;

    // Check enrollment
    const enrollment = await prisma.lmsEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });

    if (!enrollment) {
      throw new AppError('NOT_ENROLLED', LMS_ERROR_MESSAGES.NOT_ENROLLED, 403);
    }

    // Check if already attempted
    if (enrollment.finalTestAttempted) {
      throw new AppError('FINAL_TEST_ATTEMPTED', LMS_ERROR_MESSAGES.FINAL_TEST_ATTEMPTED, 400);
    }

    // Check if all modules completed
    const completedModules = await prisma.lmsModuleProgress.count({
      where: {
        userId,
        moduleId: { in: course.modules.map((m) => m.id) },
        status: LmsModuleStatus.COMPLETED,
      },
    });

    if (completedModules < course.modules.length) {
      throw new AppError('MODULES_INCOMPLETE', LMS_ERROR_MESSAGES.MODULES_INCOMPLETE, 400);
    }

    // Create attempt
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + finalTest.timeLimitMinutes * 60 * 1000);

    const attempt = await prisma.lmsTestAttempt.create({
      data: {
        userId,
        finalTestId: finalTest.id,
        testType: LmsTestType.FINAL_TEST,
        status: LmsTestAttemptStatus.IN_PROGRESS,
        attemptNumber: 1,
        totalQuestions: finalTest.questions.length,
        timeLimitMinutes: finalTest.timeLimitMinutes,
        totalMarks: finalTest.totalPoints,
        startedAt,
        expiresAt,
      },
    });

    const questions = finalTest.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      order: q.order,
      points: q.points,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        order: o.order,
      })),
    }));

    return {
      attempt: {
        id: attempt.id,
        testType: LmsTestType.FINAL_TEST,
        status: attempt.status,
        attemptNumber: 1,
        totalQuestions: attempt.totalQuestions,
        timeLimitMinutes: attempt.timeLimitMinutes,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt!,
      },
      questions,
    };
  }

  async submitFinalTest(
    courseSlug: string,
    userId: string,
    data: SubmitTestBody
  ): Promise<SubmitTestResponse> {
    const course = await prisma.lmsCourse.findUnique({
      where: { slug: courseSlug },
      include: {
        finalTest: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!course || !course.finalTest) {
      throw new AppError('TEST_NOT_AVAILABLE', LMS_ERROR_MESSAGES.TEST_NOT_AVAILABLE, 404);
    }

    const finalTest = course.finalTest;

    // Get the in-progress attempt
    const attempt = await prisma.lmsTestAttempt.findFirst({
      where: {
        userId,
        finalTestId: finalTest.id,
        status: LmsTestAttemptStatus.IN_PROGRESS,
      },
    });

    if (!attempt) {
      throw new AppError('INVALID_ATTEMPT', LMS_ERROR_MESSAGES.INVALID_ATTEMPT, 400);
    }

    // Calculate results
    const answerMap = new Map(data.answers.map((a) => [a.questionId, a.selectedOptionId]));
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let pointsEarned = 0;

    const responses: any[] = [];

    for (const question of finalTest.questions) {
      const selectedOptionId = answerMap.get(question.id);
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (selectedOptionId) {
        if (isCorrect) {
          correctAnswers++;
          pointsEarned += question.points;
        } else {
          wrongAnswers++;
        }
      }

      responses.push({
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId,
        isCorrect: selectedOptionId ? isCorrect : null,
        pointsAwarded: isCorrect ? question.points : 0,
        answeredAt: selectedOptionId ? new Date() : null,
      });
    }

    const unanswered = finalTest.questions.length - correctAnswers - wrongAnswers;
    const score = (correctAnswers / finalTest.questions.length) * 100;
    const isPassed = score >= course.passingPercentage;
    const timeSpentSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Save and update
    await prisma.$transaction(async (tx) => {
      await tx.lmsTestResponse.createMany({ data: responses });

      await tx.lmsTestAttempt.update({
        where: { id: attempt.id },
        data: {
          status: LmsTestAttemptStatus.COMPLETED,
          correctAnswers,
          wrongAnswers,
          unanswered,
          score,
          pointsEarned,
          marksObtained: pointsEarned,
          isPassed,
          timeSpentSeconds,
          completedAt: new Date(),
        },
      });

      // Update enrollment
      const enrollmentUpdate: any = {
        finalTestAttempted: true,
        finalTestScore: score,
        finalTestMarks: pointsEarned,
        finalTestPointsEarned: pointsEarned,
        totalPointsEarned: { increment: pointsEarned },
      };

      if (isPassed) {
        enrollmentUpdate.finalTestPassed = true;
        enrollmentUpdate.status = LmsEnrollmentStatus.COMPLETED;
        enrollmentUpdate.completedAt = new Date();

        // Generate certificate URL (placeholder - implement actual certificate generation)
        const certificateUrl = `https://certificates.example.com/cert-${course.slug}-${userId}-${Date.now()}.pdf`;

        enrollmentUpdate.certificateUrl = certificateUrl;
        enrollmentUpdate.certificateIssuedAt = new Date();
      }

      await tx.lmsEnrollment.update({
        where: {
          userId_courseId: { userId, courseId: course.id },
        },
        data: enrollmentUpdate,
      });
    });

    return {
      attempt: {
        id: attempt.id,
        testType: LmsTestType.FINAL_TEST,
        status: LmsTestAttemptStatus.COMPLETED,
        totalQuestions: finalTest.questions.length,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        pointsEarned,
        marksObtained: pointsEarned,
        totalMarks: finalTest.totalPoints,
        isPassed,
        timeSpentSeconds,
        completedAt: new Date(),
      },
      pointsEarned,
      passed: isPassed,
      message: isPassed
        ? 'Congratulations! You have completed the course and earned your certificate!'
        : 'You did not pass the final test. Unfortunately, the final test can only be taken once.',
    };
  }

  // =====================================================
  // USER DASHBOARD
  // =====================================================

  async getMyCourses(userId: string): Promise<EnrollmentResponse[]> {
    const enrollments = await prisma.lmsEnrollment.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: 'desc' },
      include: {
        course: {
          include: {
            category: true,
          },
        },
      },
    });

    return enrollments as any;
  }

  async getMyDashboard(userId: string): Promise<UserDashboardResponse> {
    const enrollments = await prisma.lmsEnrollment.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: 'desc' },
      include: {
        course: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    const completedCourses = enrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.COMPLETED
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.ACTIVE
    ).length;

    const totalPointsEarned = enrollments.reduce(
      (sum, e) => sum + e.totalPointsEarned,
      0
    );
    const certificatesEarned = enrollments.filter((e) => e.certificateUrl).length;

    const recentlyAccessed = enrollments
      .filter((e) => e.lastAccessedAt)
      .slice(0, 5)
      .map((e) => ({
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        shortDescription: e.course.shortDescription,
        thumbnailUrl: e.course.thumbnailUrl,
        totalModules: e.course.totalModules,
        totalPoints: e.course.totalPoints,
        totalHours: e.course.totalHours,
        price: e.course.price,
        discountPrice: e.course.discountPrice,
        currency: e.course.currency,
        difficulty: e.course.difficulty,
        instructor: e.course.instructor,
        category: e.course.category,
        isEnrolled: true,
        enrollmentProgress: e.progressPercent,
      }));

    return {
      enrolledCourses: enrollments as any,
      recentlyAccessed,
      completedCourses,
      inProgressCourses,
      totalPointsEarned,
      certificatesEarned,
    };
  }
}

export const lmsService = new LmsService();