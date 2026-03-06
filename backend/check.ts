import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

async function main() {
    const prisma = new PrismaClient();
    const langs = await prisma.programmingLanguage.findMany();
    fs.writeFileSync('out.json', JSON.stringify(langs, null, 2));
    await prisma.$disconnect();
}

main();
