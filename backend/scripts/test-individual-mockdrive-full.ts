// backend/scripts/test-individual-mockdrive-full.ts

import { PrismaClient, MockDriveModuleType, MockDriveAttemptStatus, MockDriveModuleAttemptStatus } from '@prisma/client';
import { individualMockDriveService } from '../src/module/practice/individual-mockdrive/individual-mockdrive.service';

const prisma = new PrismaClient();

async function runTest() {
  const userId = "cmnbe1830000711ngy4t24iha"; // Platform User ID
  console.log(`Starting full-process test for user: ${userId}\n`);

  try {
    // 0. CLEANUP existing attempts
    console.log("Cleaning up existing attempts...");
    await prisma.individualMockDriveAttempt.deleteMany({ where: { userId } });
    console.log("Cleanup done.\n");

    // 1. CREATE MOCKDRIVE
    console.log("--- STEP 1: CREATING MOCKDRIVE ---");
    const drive = await individualMockDriveService.create(userId, {
      title: "Comprehensive E2E Test Drive",
      description: "Testing all module types and synchronization logic",
      modules: [
        {
          moduleType: MockDriveModuleType.APTITUDE,
          order: 0,
          name: "Round 1: Aptitude",
          timeLimit: 15,
          config: {
            difficulty: "MEDIUM",
            questionTypes: ["QUANTITATIVE"],
            numberOfQuestions: 10
          } as any
        },
        {
          moduleType: MockDriveModuleType.MACHINE_CODING,
          order: 1,
          name: "Round 2: Coding",
          timeLimit: 45,
          config: {
            difficulty: "EASY",
            numberOfQuestions: 1
          } as any
        },
        {
          moduleType: MockDriveModuleType.AI_INTERVIEW,
          order: 2,
          name: "Round 3: Behavioral",
          timeLimit: 30,
          config: {
            difficulty: "MID",
            jobTitle: "Software Engineer",
            focusAreas: ["React", "System Design"],
            targetQuestions: 5
          } as any
        }
      ]
    });
    console.log(`Drive created with ID: ${drive.id}\n`);

    // 2. START ATTEMPT
    console.log("--- STEP 2: STARTING ATTEMPT ---");
    const attempt = await individualMockDriveService.startAttempt(drive.id, userId);
    console.log(`Attempt started with ID: ${attempt.id}`);
    
    // Verify initial status
    let current = await individualMockDriveService.getCurrentAttempt(userId);
    console.log(`Initial Status: ${current?.status}`);
    console.log(`Module Attempts: ${current?.moduleAttempts.length}`);
    current?.moduleAttempts.forEach(ma => {
      console.log(`- Module ${ma.module.moduleType}: ${ma.status}`);
    });
    console.log("");

    // 3. ROUND 1: APTITUDE
    console.log("--- STEP 3: COMPLETING ROUND 1 (APTITUDE) ---");
    const aptModule = current?.moduleAttempts.find(ma => ma.module.moduleType === 'APTITUDE');
    if (!aptModule) throw new Error("Aptitude module not found");

    const aptResult = await individualMockDriveService.startModule(attempt.id, aptModule.moduleId, userId);
    const aptSessionId = (aptResult.moduleAttempt.moduleData as any).sessionId;
    console.log(`Aptitude Session Created: ${aptSessionId}`);

    // Simulate completion
    await prisma.aptitudePracticeSession.update({
      where: { id: aptSessionId },
      data: {
        completedAt: new Date(),
        totalScore: 7, // 7/10 = 70%
        numberOfQuestions: 10
      }
    });
    console.log("Aptitude Session marked as COMPLETED (Score: 7/10)");

    // Sync
    console.log("Syncing attempt...");
    await individualMockDriveService.syncAttempt(userId);
    
    current = await individualMockDriveService.getCurrentAttempt(userId);
    const aptMa = current?.moduleAttempts.find(ma => ma.moduleId === aptModule.moduleId);
    const machineMa = current?.moduleAttempts.find(ma => ma.module.moduleType === 'MACHINE_CODING');
    
    console.log(`Aptitude Status: ${aptMa?.status}`);
    console.log(`Aptitude Score: ${aptMa?.percentage}%`);
    console.log(`Machine Coding Status: ${machineMa?.status} (Expected: AVAILABLE)`);
    console.log("");

    // 4. ROUND 2: MACHINE CODING
    console.log("--- STEP 4: COMPLETING ROUND 2 (MACHINE CODING) ---");
    const mcResult = await individualMockDriveService.startModule(attempt.id, machineMa!.moduleId, userId);
    const mcSessionId = (mcResult.moduleAttempt.moduleData as any).sessionId;
    console.log(`Machine Coding Session Created: ${mcSessionId}`);

    // Simulate completion
    await prisma.machinePracticeSession.update({
      where: { id: mcSessionId },
      data: {
        completedAt: new Date(),
        totalScore: 1, // 1/1 = 100%
        numberOfQuestions: 1
      }
    });
    console.log("Machine Coding Session marked as COMPLETED (Score: 1/1)");

    // Sync
    console.log("Syncing attempt...");
    await individualMockDriveService.syncAttempt(userId);
    
    current = await individualMockDriveService.getCurrentAttempt(userId);
    const mcMa = current?.moduleAttempts.find(ma => ma.moduleId === machineMa!.moduleId);
    const aiMa = current?.moduleAttempts.find(ma => ma.module.moduleType === 'AI_INTERVIEW');
    
    console.log(`Machine Status: ${mcMa?.status}`);
    console.log(`Machine Score: ${mcMa?.percentage}%`);
    console.log(`AI Interview Status: ${aiMa?.status} (Expected: AVAILABLE)`);
    console.log("");

    // 5. ROUND 3: AI INTERVIEW
    console.log("--- STEP 5: COMPLETING ROUND 3 (AI INTERVIEW) ---");
    const aiResult = await individualMockDriveService.startModule(attempt.id, aiMa!.moduleId, userId);
    const aiSessionId = (aiResult.moduleAttempt.moduleData as any).sessionId;
    console.log(`AI Interview Session Created: ${aiSessionId}`);

    // Simulate completion + Feedback
    await prisma.aiInterviewSession.update({
      where: { id: aiSessionId },
      data: { status: 'COMPLETED' }
    });
    
    await prisma.aiInterviewFeedback.create({
      data: {
        sessionId: aiSessionId,
        userId: userId,
        overallScore: 8.5 as any, // 8.5/10 -> 85%
        overallSummary: "Good performance overall.",
        keyStrengths: ["Communication", "React knowledge"],
        areasForImprovement: ["System design depth"],
        feedbackJson: { recommendations: ["Study CAP theorem"] }
      }
    });
    console.log("AI Interview Session marked as COMPLETED (Score: 8.5/10)");

    // Sync
    console.log("Syncing final attempt...");
    await individualMockDriveService.syncAttempt(userId);
    
    // 6. FINAL VERIFICATION
    console.log("--- STEP 6: FINAL VERIFICATION ---");
    const finalAttempt = await prisma.individualMockDriveAttempt.findUnique({
      where: { id: attempt.id },
      include: { moduleAttempts: true }
    });

    console.log(`Final Attempt Status: ${finalAttempt?.status}`);
    console.log(`Final Total Score: ${finalAttempt?.totalScore}%`);
    
    // Math: (70 + 100 + 85) / 3 = 255 / 3 = 85%
    const expected = (70 + 100 + 85) / 3;
    console.log(`Expected Total Score: ${expected}%`);

    if (finalAttempt?.status === MockDriveAttemptStatus.COMPLETED && finalAttempt.totalScore === expected) {
      console.log("\n✅ ALL TESTS PASSED: Individual MockDrive lifecycle and synchronization verified.");
    } else {
      console.log("\n❌ TEST FAILED: Score mismatch or status not completed.");
    }

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
