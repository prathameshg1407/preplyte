export declare const formatTimeRemaining: (seconds: number) => string;
export declare const calculateTimeRemaining: (expiresAt: Date) => number;
export declare const getSessionStatus: (completedAt: Date | null, expiresAt: Date) => "in_progress" | "completed" | "expired";
export declare const shuffleArray: <T>(array: T[]) => T[];
export declare const calculateScore: (correct: number, total: number) => number;
export declare const calculateAccuracy: (correct: number, attempted: number) => number;
//# sourceMappingURL=helpers.d.ts.map