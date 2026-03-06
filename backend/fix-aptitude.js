const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAptitudeQuestions() {
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

        const matchedJson = questionsJson.find(jq => jq.questionText === dbQ.questionText);
        if (!matchedJson) continue;

        const correctOptionInJson = matchedJson.correctAnswerId;
        // Find the corresponding DB option
        // It's tricky because the text matches but we just need the option that corresponds to the correct one
        // But matchedJson.correctAnswerId is an optionId like 'a', 'b', 'c', 'd'.
        // matchedJson.options has { optionId: 'a', text: '5' }
        const correctJsonOptionObj = matchedJson.options.find(o => o.optionId === correctOptionInJson);
        if (!correctJsonOptionObj) continue;

        const dbOption = dbQ.options.find(o => o.text === correctJsonOptionObj.text);
        if (!dbOption) continue;

        await prisma.aptitudeQuestion.update({
            where: { id: dbQ.id },
            data: { correctOptionId: dbOption.id }
        });
        updatedCount++;
    }

    console.log(`Updated ${updatedCount} questions.`);
}

fixAptitudeQuestions().catch(console.error).finally(() => prisma.$disconnect());
