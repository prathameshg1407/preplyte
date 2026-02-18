import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.lmsCourse.findMany({
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
        }
    });
    console.log(JSON.stringify(courses, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
