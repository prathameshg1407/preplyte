import { lmsService } from './src/module/lms/lms.service';
import { prisma } from './src/lib/db';

async function testService() {
    const courseSlug = 'prompt-engineering';
    const moduleOrder = 1;
    const userId = 'cml92k1k4000417d09...'; // I need a valid USER ID

    // Get a valid user ID first
    const user = await prisma.user.findFirst({
        where: { role: 'USER' }
    });

    if (!user) {
        console.log('No user found');
        return;
    }

    console.log(`Testing with user: ${user.id} (${user.email})`);

    try {
        console.log(`\n--- getCourseBySlug(${courseSlug}) ---`);
        const course = await lmsService.getCourseBySlug(courseSlug, user.id);
        console.log('Course details fetched successfully');
        console.log('Modules length:', course.modules.length);
    } catch (err) {
        console.error('getCourseBySlug error:', err);
    }

    try {
        console.log(`\n--- getModuleDetails(${courseSlug}, ${moduleOrder}) ---`);
        const module = await lmsService.getModuleDetails(courseSlug, moduleOrder, user.id);
        console.log('Module details fetched successfully:', module.module.title);
    } catch (err) {
        console.error('getModuleDetails error:', err);
    }
}

testService()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
