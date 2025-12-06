interface ParseOptions {
    /** Maximum content length to process */
    maxLength?: number;
    /** Whether to log parse failures */
    silent?: boolean;
}
export declare class JsonParser {
    /**
     * Safely parse JSON with fallback handling
     * Attempts multiple extraction strategies for LLM responses
     */
    parse<T>(content: string, context: string, options?: ParseOptions): T;
    /**
     * Safe parse that returns null instead of throwing
     */
    safeParse<T>(content: string, context: string, options?: ParseOptions): T | null;
    /**
     * Parse with a default value fallback
     */
    parseWithDefault<T>(content: string, context: string, defaultValue: T, options?: ParseOptions): T;
    /**
     * Validate parsed JSON against a schema/type guard
     */
    parseAndValidate<T>(content: string, context: string, validator: (data: unknown) => data is T, options?: ParseOptions): T;
    private tryParse;
    private extractJsonFromMarkdown;
    private findJsonInContent;
    private findBalancedJson;
}
export declare const jsonParser: JsonParser;
export {};
//# sourceMappingURL=json-parser.d.ts.map