import Groq from 'groq-sdk';
export interface GroqApiOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    responseFormat?: 'json' | 'text';
    systemPrompt?: string;
}
export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface GroqChatOptions extends GroqApiOptions {
    messages: GroqMessage[];
}
export declare class GroqApiManager {
    private groq;
    private readonly apiKeys;
    private currentKeyIndex;
    private readonly maxRetries;
    private requestCount;
    private lastRequestTime;
    private readonly keyExhausted;
    private keyExhaustionResetTime;
    constructor(apiKeys: string[], maxRetries?: number);
    callApi(prompt: string, options?: GroqApiOptions): Promise<Groq.Chat.ChatCompletion>;
    chat(options: GroqChatOptions): Promise<Groq.Chat.ChatCompletion>;
    complete(prompt: string, options?: Omit<GroqApiOptions, 'responseFormat'>): Promise<string>;
    generateJson<T>(prompt: string, options?: Omit<GroqApiOptions, 'responseFormat'>): Promise<T>;
    get currentApiKeyIndex(): number;
    get totalApiKeys(): number;
    get stats(): {
        requestCount: number;
        currentKey: number;
        totalKeys: number;
        exhaustedKeys: number;
    };
    private initializeClient;
    private prepareMessages;
    private ensureJsonInMessages;
    private isRateLimitError;
    private isRetryableError;
    private getErrorMessage;
    private throttle;
    private calculateBackoff;
    private delay;
}
//# sourceMappingURL=groq-manager.d.ts.map