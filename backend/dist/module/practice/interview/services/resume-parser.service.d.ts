import { ParsedResume, StructuredResume, CandidateProfile } from '../interview.types';
declare class ResumeParserService {
    private groq;
    constructor();
    /**
     * Parse resume from database by ID
     */
    parseResumeById(userId: string, resumeId: string): Promise<ParsedResume>;
    /**
     * Parse resume from buffer
     */
    parseResumeBuffer(buffer: Buffer, mimeType: string): Promise<ParsedResume>;
    /**
     * Extract candidate profile from structured resume
     */
    extractCandidateProfile(resume: StructuredResume): CandidateProfile;
    /**
     * Get user's default resume or first available
     */
    getDefaultResumeForUser(userId: string): Promise<{
        resumeId: string;
        parsed: ParsedResume;
    } | null>;
    private extractTextFromUrl;
    private extractTextFromBuffer;
    private cleanText;
    private structureResumeText;
    private validateAndFillDefaults;
    private createMinimalStructure;
    private extractSkillsFromText;
    private calculateYearsOfExperience;
    private extractIndustries;
    private generateHash;
    private getCachedParse;
}
export declare const resumeParserService: ResumeParserService;
export { ResumeParserService };
//# sourceMappingURL=resume-parser.service.d.ts.map