import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const course = await prisma.lmsCourse.findFirst({
            where: { slug: 'prompt-engineering' },
            include: {
                modules: {
                    select: {
                        id: true,
                        order: true,
                        title: true,
                        isActive: true
                    }
                }
            }
        });
        console.log(JSON.stringify(course, null, 2));
    } catch (err) {
        console.error('Error fetching course:', err);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
