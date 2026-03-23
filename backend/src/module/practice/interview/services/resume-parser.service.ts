// src/module/practice/interview/services/resume-parser.service.ts

import pdfParse from 'pdf-parse';
import { createHash } from 'crypto';
import { GroqApiManager } from '../../../../utils/groq-manager';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import { NotFoundError, BadRequestError, InternalError } from '../../../../utils/errors';
import {
  ParsedResume,
  StructuredResume,
  CandidateProfile,
} from '../interview.types';
import { RESUME_PARSING_PROMPT } from '../interview.prompts';
import { AI_CONFIG } from '../interview.constants';

// =====================================================
// SERVICE CLASS
// =====================================================

class ResumeParserService {
  private groq: GroqApiManager;

  constructor() {
    this.groq = new GroqApiManager();
  }

  // ===================================================
  // PUBLIC METHODS
  // ===================================================

  /**
   * Parse resume from database by ID
   */
  async parseResumeById(userId: string, resumeId: string): Promise<ParsedResume> {
    logger.info('[ResumeParser] Parsing resume by ID', { userId, resumeId });

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume');
    }

    // Check if we have a cached parse
    if (resume.parsedTextHash && resume.lastParsedAt) {
      const cachedParse = await this.getCachedParse(resumeId, resume.parsedTextHash);
      if (cachedParse) {
        logger.debug('[ResumeParser] Using cached parse', { resumeId });
        return cachedParse;
      }
    }

    // Fetch and parse the resume
    const rawText = await this.extractTextFromUrl(resume.fileUrl, resume.mimeType || 'application/pdf');
    const structured = await this.structureResumeText(rawText);
    const hash = this.generateHash(rawText);

    // Update the resume with parse info
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsedTextHash: hash,
        lastParsedAt: new Date(),
      },
    });

    const parsed: ParsedResume = {
      rawText,
      structured,
      hash,
      parsedAt: new Date(),
    };

    logger.info('[ResumeParser] Resume parsed successfully', { resumeId });
    return parsed;
  }

  /**
   * Parse resume from buffer
   */
  async parseResumeBuffer(buffer: Buffer, mimeType: string): Promise<ParsedResume> {
    logger.info('[ResumeParser] Parsing resume from buffer');

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
  extractCandidateProfile(resume: StructuredResume): CandidateProfile {
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
  async getDefaultResumeForUser(userId: string): Promise<{ resumeId: string; parsed: ParsedResume } | null> {
    const resume = await prisma.resume.findFirst({
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

  private async extractTextFromUrl(url: string, mimeType: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new InternalError('Failed to fetch resume file');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return this.extractTextFromBuffer(buffer, mimeType);
    } catch (error) {
      logger.error('[ResumeParser] Failed to extract text from URL', error);
      throw new InternalError('Failed to extract resume text');
    }
  }

  private async extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return this.cleanText(data.text);
    }

    if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // For Word documents, we'll use a simplified approach
      // In production, you'd want to use mammoth or similar
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return this.cleanText(result.value);
    }

    throw new BadRequestError('Unsupported file type for text extraction');
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  // ===================================================
  // PRIVATE: AI STRUCTURING
  // ===================================================

  private async structureResumeText(rawText: string): Promise<StructuredResume> {
    try {
      const response = await this.groq.chat({
        messages: [
          { role: 'system', content: RESUME_PARSING_PROMPT },
          { role: 'user', content: rawText },
        ],
        temperature: 0.1,
        maxTokens: 2000,
        responseFormat: 'json',
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content) as StructuredResume;

      // Validate and fill defaults
      return this.validateAndFillDefaults(parsed);
    } catch (error) {
      logger.error('[ResumeParser] Failed to structure resume', error);

      // Return a minimal structure if AI fails
      return this.createMinimalStructure(rawText);
    }
  }

  private validateAndFillDefaults(data: Partial<StructuredResume>): StructuredResume {
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

  private createMinimalStructure(rawText: string): StructuredResume {
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

  private extractSkillsFromText(text: string): string[] {
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

  private calculateYearsOfExperience(experience: { duration?: string; startDate?: string; endDate?: string }[]): number {
    if (experience.length === 0) return 0;

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
      } else if (exp.duration) {
        // Try to parse duration string like "2 years" or "Jan 2020 - Dec 2022"
        const yearMatch = exp.duration.match(/(\d+)\s*year/i);
        const monthMatch = exp.duration.match(/(\d+)\s*month/i);

        if (yearMatch) totalMonths += parseInt(yearMatch[1]) * 12;
        if (monthMatch) totalMonths += parseInt(monthMatch[1]);
      }
    }

    return Math.round(totalMonths / 12);
  }

  private extractIndustries(experience: { company?: string }[]): string[] {
    // This is a simplified version - in production you'd use company data
    return [...new Set(experience.map((e) => e.company || '').filter(Boolean))].slice(0, 5);
  }

  private generateHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  private async getCachedParse(resumeId: string, hash: string): Promise<ParsedResume | null> {
    // In production, you'd want to store the parsed result in cache or DB
    // For now, we just return null to force re-parsing
    return null;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const resumeParserService = new ResumeParserService();
export { ResumeParserService };