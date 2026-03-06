import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('Reading aptitude questions json...');
    const jsonPath = path.join(__dirname, 'prisma', 'data', 'aptitude-questions.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const questionsJson = JSON.parse(rawData);

    console.log('Fetching questions from DB...');
    const dbQuestions = await prisma.aptitudeQuestion.findMany({
        include: { options: true }
    });

    let updatedCount = 0;

    for (const dbQ of dbQuestions) {
        if (dbQ.correctOptionId) continue; // Already has it

        const matchedJson = questionsJson.find((jq: any) => jq.questionText === dbQ.questionText);
        if (!matchedJson) continue;

        const correctOptionInJson = matchedJson.correctAnswerId;

        const correctJsonOptionObj = matchedJson.options.find((o: any) => o.optionId === correctOptionInJson);
        if (!correctJsonOptionObj) continue;

        const dbOption = dbQ.options.find((o: any) => o.text === correctJsonOptionObj.text);
        if (!dbOption) continue;

        await prisma.aptitudeQuestion.update({
            where: { id: dbQ.id },
            data: { correctOptionId: dbOption.id }
        });
        updatedCount++;
    }

    console.log(`Updated ${updatedCount} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
