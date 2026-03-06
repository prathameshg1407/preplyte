const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
    const prisma = new PrismaClient();
    const langs = await prisma.programmingLanguage.findMany();
    fs.writeFileSync('out.json', JSON.stringify(langs, null, 2));
    await prisma.$disconnect();
}

main();
