"use strict";
// src/module/mock-drive/attempt/attempt.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewAudioChunkSchema = exports.interviewSkipSchema = exports.interviewRespondSchema = exports.machineRunSchema = exports.machineSubmitSchema = exports.aptitudeMarkReviewSchema = exports.aptitudeClearSchema = exports.aptitudeAnswerSchema = exports.moduleIdSchema = exports.mockDriveIdSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Param Schemas
// ============================================
exports.mockDriveIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid('Invalid drive ID format'),
    }),
});
exports.moduleIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid('Invalid drive ID format'),
        moduleId: zod_1.z.string().uuid('Invalid module ID format'),
    }),
});
// ============================================
// Aptitude Module Schemas
// ============================================
exports.aptitudeAnswerSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        questionId: zod_1.z.string().uuid('Invalid question ID format'),
        selectedOptionId: zod_1.z.string().uuid('Invalid option ID format'),
        timeSpent: zod_1.z.number().int().min(0).optional(),
    }),
});
exports.aptitudeClearSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        questionId: zod_1.z.string().uuid('Invalid question ID format'),
    }),
});
exports.aptitudeMarkReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        questionId: zod_1.z.string().uuid('Invalid question ID format'),
        isMarked: zod_1.z.boolean().default(true),
    }),
});
// ============================================
// Machine Coding Module Schemas
// ============================================
exports.machineSubmitSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        questionId: zod_1.z.string().uuid('Invalid question ID format'),
        code: zod_1.z.string().min(1, 'Code cannot be empty'),
        languageId: zod_1.z.number().int().positive('Invalid language ID'),
    }),
});
exports.machineRunSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        questionId: zod_1.z.string().uuid('Invalid question ID format'),
        code: zod_1.z.string().min(1, 'Code cannot be empty'),
        languageId: zod_1.z.number().int().positive('Invalid language ID'),
        customInput: zod_1.z.string().optional(),
    }),
});
// ============================================
// Interview Module Schemas
// ============================================
exports.interviewRespondSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        answer: zod_1.z.string().min(1, 'Answer cannot be empty'),
        timeTaken: zod_1.z.number().int().min(0).optional(),
        audioBuffer: zod_1.z.string().optional(), // Base64 encoded audio
    }),
});
exports.interviewSkipSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        reason: zod_1.z.string().max(500).optional(),
    }),
});
exports.interviewAudioChunkSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().uuid(),
        moduleId: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        chunk: zod_1.z.string().min(1, 'Audio chunk cannot be empty'),
        isFinal: zod_1.z.boolean().default(false),
    }),
});
//# sourceMappingURL=attempt.validation.js.map