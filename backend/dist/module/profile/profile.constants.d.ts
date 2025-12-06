export declare const RESUME_LIMITS: {
    readonly MAX_FILE_SIZE: number;
    readonly MIN_TEXT_LENGTH: 100;
    readonly MAX_PER_USER: 5;
};
export declare const PROFILE_PHOTO_LIMITS: {
    readonly MAX_FILE_SIZE: number;
};
export declare const ALLOWED_RESUME_MIME_TYPES: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export declare const ALLOWED_IMAGE_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
export declare const STUDENT_ID_PATTERN: RegExp;
export declare const COURSE_YEARS: readonly ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
export declare const DEPARTMENTS: readonly ["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil", "Chemical", "Biotechnology", "Other"];
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly NOT_FOUND: 404;
};
export declare const PROFILE_CACHE_KEYS: {
    readonly studentProfile: (userId: string) => string;
    readonly resumes: (userId: string) => string;
    readonly defaultResume: (userId: string) => string;
};
export declare const PROFILE_CACHE_TTL: {
    readonly STUDENT_PROFILE: 300;
    readonly RESUMES: 180;
};
//# sourceMappingURL=profile.constants.d.ts.map