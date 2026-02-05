// backend/src/module/admin/lms/test/test.types.ts

export interface CreateModuleTestDto {
    moduleId: string;
    title: string;
    instructions?: string;
    totalQuestions?: number;
    passingScore?: number;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    pointsPerQuestion?: number;
    isActive?: boolean;
}

export interface CreateFinalTestDto {
    courseId: string;
    title: string;
    instructions?: string;
    totalQuestions?: number;
    passingScore?: number;
    timeLimitMinutes?: number;
    pointsPerQuestion?: number;
    isActive?: boolean;
}

export interface CreateTestQuestionDto {
    questionText: string;
    explanation?: string;
    order?: number;
    points?: number;
    options: CreateTestOptionDto[];
}

export interface CreateTestOptionDto {
    text: string;
    isCorrect: boolean;
    order?: number;
}

export interface UpdateTestQuestionDto {
    questionText?: string;
    explanation?: string;
    order?: number;
    points?: number;
    isActive?: boolean;
}

export interface TestWithQuestions {
    id: string;
    title: string;
    instructions: string | null;
    totalQuestions: number;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts: number;
    pointsPerQuestion: number;
    totalPoints: number;
    isActive: boolean;
    questions: {
        id: string;
        questionText: string;
        explanation: string | null;
        order: number;
        points: number;
        isActive: boolean;
        options: {
            id: string;
            text: string;
            isCorrect: boolean;
            order: number;
        }[];
    }[];
}

export interface BulkCreateQuestionsDto {
    questions: CreateTestQuestionDto[];
}