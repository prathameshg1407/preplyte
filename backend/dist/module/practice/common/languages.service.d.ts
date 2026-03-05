export declare class LanguagesService {
    /**
     * Get all active programming languages
     */
    getAllLanguages(activeOnly?: boolean): Promise<{
        languages: {
            id: string;
            name: string;
            isActive: boolean;
            monacoId: string;
            judge0Id: number;
        }[];
        totalCount: number;
    }>;
    /**
     * Get language details with template
     */
    getLanguageById(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        monacoId: string;
        judge0Id: number;
        template: string;
    }>;
    /**
     * Get language by Judge0 ID
     */
    getLanguageByJudge0Id(judge0Id: number): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        monacoId: string;
        judge0Id: number;
        template: string;
    }>;
}
export declare const languagesService: LanguagesService;
//# sourceMappingURL=languages.service.d.ts.map