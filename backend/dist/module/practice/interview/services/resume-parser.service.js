"use strict";
// src/module/practice/interview/services/resume-parser.service.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeParserService = exports.resumeParserService = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const crypto_1 = require("crypto");
const groq_manager_1 = require("../../../../utils/groq-manager");
const db_1 = require("../../../../lib/db");
const logger_1 = require("../../../../utils/logger");
const errors_1 = require("../../../../utils/errors");
const interview_prompts_1 = require("../interview.prompts");
// =====================================================
// SERVICE CLASS
// =====================================================
class ResumeParserService {
    groq;
    constructor() {
        const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
            .split(',')
            .filter(Boolean);
        this.groq = new groq_manager_1.GroqApiManager(apiKeys);
    }
    // ===================================================
    // PUBLIC METHODS
    // ===================================================
    /**
     * Parse resume from database by ID
     */
    async parseResumeById(userId, resumeId) {
        logger_1.logger.info('[ResumeParser] Parsing resume by ID', { userId, resumeId });
        const resume = await db_1.prisma.resume.findFirst({
            where: { id: resumeId, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume');
        }
        // Check if we have a cached parse
        if (resume.parsedTextHash && resume.lastParsedAt) {
            const cachedParse = await this.getCachedParse(resumeId, resume.parsedTextHash);
            if (cachedParse) {
                logger_1.logger.debug('[ResumeParser] Using cached parse', { resumeId });
                return cachedParse;
            }
        }
        // Fetch and parse the resume
        const rawText = await this.extractTextFromUrl(resume.fileUrl, resume.mimeType || 'application/pdf');
        const structured = await this.structureResumeText(rawText);
        const hash = this.generateHash(rawText);
        // Update the resume with parse info
        await db_1.prisma.resume.update({
            where: { id: resumeId },
            data: {
                parsedTextHash: hash,
                lastParsedAt: new Date(),
            },
        });
        const parsed = {
            rawText,
            structured,
            hash,
            parsedAt: new Date(),
        };
        logger_1.logger.info('[ResumeParser] Resume parsed successfully', { resumeId });
        return parsed;
    }
    /**
     * Parse resume from buffer
     */
    async parseResumeBuffer(buffer, mimeType) {
        logger_1.logger.info('[ResumeParser] Parsing resume from buffer');
        const rawText = await this.extractTextFromBuffer(buffer, mimeType);
        const structured = await this.structureResumeText(rawText);
        const hash = this.generateHash(rawText);
        return {
            rawText,
            structured,
            hash,
            parsedAt: new Date(),
        };
    }
    /**
     * Extract candidate profile from structured resume
     */
    extractCandidateProfile(resume) {
        const yearsOfExperience = this.calculateYearsOfExperience(resume.experience);
        const primarySkills = resume.skills.slice(0, 5);
        const recentRole = resume.experience[0]?.role || 'Not specified';
        const industryBackground = this.extractIndustries(resume.experience);
        return {
            name: resume.name,
            yearsOfExperience,
            primarySkills,
            recentRole,
            industryBackground,
        };
    }
    /**
     * Get user's default resume or first available
     */
    async getDefaultResumeForUser(userId) {
        const resume = await db_1.prisma.resume.findFirst({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        if (!resume) {
            return null;
        }
        const parsed = await this.parseResumeById(userId, resume.id);
        return { resumeId: resume.id, parsed };
    }
    // ===================================================
    // PRIVATE: TEXT EXTRACTION
    // ===================================================
    async extractTextFromUrl(url, mimeType) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new errors_1.InternalError('Failed to fetch resume file');
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            return this.extractTextFromBuffer(buffer, mimeType);
        }
        catch (error) {
            logger_1.logger.error('[ResumeParser] Failed to extract text from URL', error);
            throw new errors_1.InternalError('Failed to extract resume text');
        }
    }
    async extractTextFromBuffer(buffer, mimeType) {
        if (mimeType === 'application/pdf') {
            const data = await (0, pdf_parse_1.default)(buffer);
            return this.cleanText(data.text);
        }
        if (mimeType === 'application/msword' ||
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // For Word documents, we'll use a simplified approach
            // In production, you'd want to use mammoth or similar
            const mammoth = await Promise.resolve().then(() => __importStar(require('mammoth')));
            const result = await mammoth.extractRawText({ buffer });
            return this.cleanText(result.value);
        }
        throw new errors_1.BadRequestError('Unsupported file type for text extraction');
    }
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }
    // ===================================================
    // PRIVATE: AI STRUCTURING
    // ===================================================
    async structureResumeText(rawText) {
        try {
            const response = await this.groq.chat({
                messages: [
                    { role: 'system', content: interview_prompts_1.RESUME_PARSING_PROMPT },
                    { role: 'user', content: rawText },
                ],
                temperature: 0.1,
                maxTokens: 2000,
                responseFormat: 'json',
            });
            const content = response.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(content);
            // Validate and fill defaults
            return this.validateAndFillDefaults(parsed);
        }
        catch (error) {
            logger_1.logger.error('[ResumeParser] Failed to structure resume', error);
            // Return a minimal structure if AI fails
            return this.createMinimalStructure(rawText);
        }
    }
    validateAndFillDefaults(data) {
        return {
            name: data.name || 'Unknown',
            email: data.email || '',
            phone: data.phone || '',
            summary: data.summary,
            skills: Array.isArray(data.skills) ? data.skills : [],
            experience: Array.isArray(data.experience)
                ? data.experience.map((e) => ({
                    company: e.company || 'Unknown',
                    role: e.role || 'Unknown',
                    duration: e.duration || '',
                    startDate: e.startDate,
                    endDate: e.endDate,
                    responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : [],
                    technologies: Array.isArray(e.technologies) ? e.technologies : [],
                }))
                : [],
            education: Array.isArray(data.education)
                ? data.education.map((e) => ({
                    institution: e.institution || 'Unknown',
                    degree: e.degree || 'Unknown',
                    field: e.field,
                    year: e.year || '',
                    gpa: e.gpa,
                }))
                : [],
            projects: Array.isArray(data.projects)
                ? data.projects.map((p) => ({
                    name: p.name || 'Unknown',
                    description: p.description || '',
                    technologies: Array.isArray(p.technologies) ? p.technologies : [],
                    highlights: Array.isArray(p.highlights) ? p.highlights : [],
                    url: p.url,
                }))
                : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            achievements: Array.isArray(data.achievements) ? data.achievements : [],
        };
    }
    createMinimalStructure(rawText) {
        // Extract basic info using regex patterns
        const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
        const phoneMatch = rawText.match(/\+?[\d\s-]{10,}/);
        return {
            name: 'Unknown',
            email: emailMatch?.[0] || '',
            phone: phoneMatch?.[0] || '',
            skills: this.extractSkillsFromText(rawText),
            experience: [],
            education: [],
            projects: [],
        };
    }
    extractSkillsFromText(text) {
        const commonSkills = [
            'javascript', 'typescript', 'python', 'java', 'c++', 'react',
            'node.js', 'angular', 'vue', 'sql', 'mongodb', 'aws', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'machine learning',
        ];
        const lowerText = text.toLowerCase();
        return commonSkills.filter((skill) => lowerText.includes(skill));
    }
    // ===================================================
    // PRIVATE: HELPERS
    // ===================================================
    calculateYearsOfExperience(experience) {
        if (experience.length === 0)
            return 0;
        let totalMonths = 0;
        for (const exp of experience) {
            if (exp.startDate) {
                const start = new Date(exp.startDate);
                const end = exp.endDate?.toLowerCase() === 'present'
                    ? new Date()
                    : new Date(exp.endDate || new Date());
                const months = (end.getFullYear() - start.getFullYear()) * 12 +
                    (end.getMonth() - start.getMonth());
                totalMonths += Math.max(0, months);
            }
            else if (exp.duration) {
                // Try to parse duration string like "2 years" or "Jan 2020 - Dec 2022"
                const yearMatch = exp.duration.match(/(\d+)\s*year/i);
                const monthMatch = exp.duration.match(/(\d+)\s*month/i);
                if (yearMatch)
                    totalMonths += parseInt(yearMatch[1]) * 12;
                if (monthMatch)
                    totalMonths += parseInt(monthMatch[1]);
            }
        }
        return Math.round(totalMonths / 12);
    }
    extractIndustries(experience) {
        // This is a simplified version - in production you'd use company data
        return [...new Set(experience.map((e) => e.company || '').filter(Boolean))].slice(0, 5);
    }
    generateHash(text) {
        return (0, crypto_1.createHash)('sha256').update(text).digest('hex');
    }
    async getCachedParse(resumeId, hash) {
        // In production, you'd want to store the parsed result in cache or DB
        // For now, we just return null to force re-parsing
        return null;
    }
}
exports.ResumeParserService = ResumeParserService;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.resumeParserService = new ResumeParserService();
//# sourceMappingURL=resume-parser.service.js.map