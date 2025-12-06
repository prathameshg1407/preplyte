export interface LanguageConfig {
    id: number;
    name: string;
    monacoId: string;
}
export declare const SUPPORTED_LANGUAGES: Record<string, LanguageConfig>;
export declare const getLanguageId: (language: string) => number;
export declare const getMonacoLanguageId: (language: string) => string;
export declare const getSupportedLanguages: () => LanguageConfig[];
//# sourceMappingURL=judge0.languages.d.ts.map