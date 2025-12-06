"use strict";
// src/lib/judge0/judge0.languages.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedLanguages = exports.getMonacoLanguageId = exports.getLanguageId = exports.SUPPORTED_LANGUAGES = void 0;
exports.SUPPORTED_LANGUAGES = {
    python: { id: 71, name: 'Python (3.8.1)', monacoId: 'python' },
    python3: { id: 71, name: 'Python (3.8.1)', monacoId: 'python' },
    javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)', monacoId: 'javascript' },
    nodejs: { id: 63, name: 'JavaScript (Node.js 12.14.0)', monacoId: 'javascript' },
    java: { id: 62, name: 'Java (OpenJDK 13.0.1)', monacoId: 'java' },
    cpp: { id: 54, name: 'C++ (GCC 9.2.0)', monacoId: 'cpp' },
    'c++': { id: 54, name: 'C++ (GCC 9.2.0)', monacoId: 'cpp' },
    c: { id: 50, name: 'C (GCC 9.2.0)', monacoId: 'c' },
    csharp: { id: 51, name: 'C# (Mono 6.6.0.161)', monacoId: 'csharp' },
    'c#': { id: 51, name: 'C# (Mono 6.6.0.161)', monacoId: 'csharp' },
    go: { id: 60, name: 'Go (1.13.5)', monacoId: 'go' },
    golang: { id: 60, name: 'Go (1.13.5)', monacoId: 'go' },
    rust: { id: 73, name: 'Rust (1.40.0)', monacoId: 'rust' },
    ruby: { id: 72, name: 'Ruby (2.7.0)', monacoId: 'ruby' },
    swift: { id: 83, name: 'Swift (5.2.3)', monacoId: 'swift' },
    kotlin: { id: 78, name: 'Kotlin (1.3.70)', monacoId: 'kotlin' },
    typescript: { id: 74, name: 'TypeScript (3.7.4)', monacoId: 'typescript' },
    php: { id: 68, name: 'PHP (7.4.1)', monacoId: 'php' },
    scala: { id: 81, name: 'Scala (2.13.2)', monacoId: 'scala' },
    r: { id: 80, name: 'R (4.0.0)', monacoId: 'r' },
};
const getLanguageId = (language) => {
    const normalizedLang = language.toLowerCase().trim();
    const langConfig = exports.SUPPORTED_LANGUAGES[normalizedLang];
    if (!langConfig) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(exports.SUPPORTED_LANGUAGES).join(', ')}`);
    }
    return langConfig.id;
};
exports.getLanguageId = getLanguageId;
const getMonacoLanguageId = (language) => {
    const normalizedLang = language.toLowerCase().trim();
    return exports.SUPPORTED_LANGUAGES[normalizedLang]?.monacoId || 'plaintext';
};
exports.getMonacoLanguageId = getMonacoLanguageId;
const getSupportedLanguages = () => {
    const uniqueLanguages = new Map();
    Object.entries(exports.SUPPORTED_LANGUAGES).forEach(([, value]) => {
        if (!uniqueLanguages.has(value.id)) {
            uniqueLanguages.set(value.id, { ...value });
        }
    });
    return Array.from(uniqueLanguages.values());
};
exports.getSupportedLanguages = getSupportedLanguages;
//# sourceMappingURL=judge0.languages.js.map