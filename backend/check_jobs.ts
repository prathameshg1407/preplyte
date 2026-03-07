import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const latestJob = await prisma.jobPosting.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (latestJob && latestJob.status === 'DRAFT') {
    await prisma.jobPosting.update({
      where: { id: latestJob.id },
      data: { status: 'PUBLISHED', publishedAt: new Date() }
    });
    console.log(`Updated job ${latestJob.id} to PUBLISHED`);
  }

  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      roleTitle: true,
      companyName: true,
      status: true,
      createdAt: true
    }
  });
  console.log('Recent Jobs:', JSON.stringify(jobs, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
