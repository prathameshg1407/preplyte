export declare const MOCKDRIVE_CONSTANTS: {
    readonly AUTO_SUBMIT_WARNING_MINUTES: 5;
    readonly GRACE_PERIOD_SECONDS: 30;
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly MAX_PAGE_SIZE: 50;
    readonly APTITUDE_DEFAULT_MARKS_PER_QUESTION: 1;
    readonly APTITUDE_DEFAULT_NEGATIVE_MARKING: 0.25;
    readonly MACHINE_MAX_SCORE_PER_QUESTION: 100;
    readonly AI_INTERVIEW_MAX_SCORE: 100;
    readonly MODULE_TRANSITION_DELAY_MS: 3000;
    readonly MAX_TAB_SWITCHES_WARNING: 3;
    readonly MAX_TAB_SWITCHES_TERMINATE: 5;
};
export declare const MODULE_TYPE_LABELS: {
    readonly APTITUDE: "Aptitude Test";
    readonly MACHINE_CODING: "Machine Coding";
    readonly AI_INTERVIEW: "AI Interview";
};
export declare const ATTEMPT_STATUS_FLOW: {
    readonly NOT_STARTED: readonly ["IN_PROGRESS"];
    readonly IN_PROGRESS: readonly ["COMPLETED", "TIMED_OUT", "ABANDONED"];
    readonly COMPLETED: readonly [];
    readonly TIMED_OUT: readonly [];
    readonly ABANDONED: readonly [];
};
export declare const MODULE_ATTEMPT_STATUS_FLOW: {
    readonly LOCKED: readonly ["AVAILABLE"];
    readonly AVAILABLE: readonly ["IN_PROGRESS"];
    readonly IN_PROGRESS: readonly ["COMPLETED", "TIMED_OUT", "SKIPPED"];
    readonly COMPLETED: readonly [];
    readonly TIMED_OUT: readonly [];
    readonly SKIPPED: readonly [];
};
//# sourceMappingURL=mockdrive.constants.d.ts.map