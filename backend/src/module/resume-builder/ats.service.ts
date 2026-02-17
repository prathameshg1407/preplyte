import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export interface ATSAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordAnalysis: {
    found: string[];
    missing: string[];
  };
  formatting: {
    score: number;
    issues: string[];
  };
  sections: {
    name: string;
    present: boolean;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  }[];
}

export class ATSService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Debug log (remove after testing)
    logger.info('Gemini API Key loaded:', { 
      keyPrefix: apiKey.substring(0, 10) + '...', 
      keyLength: apiKey.length 
    });

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Parse PDF file and extract text
   */
  async parsePDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      logger.error('PDF parsing error:', error);
      throw new AppError('PARSE_ERROR', 'Failed to parse PDF file', 400);
    }
  }

  /**
   * Parse Word document and extract text
   */
  async parseWord(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      logger.error('Word parsing error:', error);
      throw new AppError('PARSE_ERROR', 'Failed to parse Word document', 400);
    }
  }

  /**
   * Extract text from uploaded file based on file type
   */
  async extractText(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      return this.parsePDF(file.buffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return this.parseWord(file.buffer);
    } else {
      throw new AppError('INVALID_FILE_TYPE', 'Only PDF and Word documents are supported', 400);
    }
  }

  /**
   * Analyze resume text using Gemini AI
   */
  async analyzeResume(resumeText: string, jobRole?: string, jobDescription?: string): Promise<ATSAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(resumeText, jobRole, jobDescription);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      return this.parseAIResponse(text);
    } catch (error) {
      logger.error('AI analysis error:', error);
      throw new AppError('ANALYSIS_ERROR', 'Failed to analyze resume', 500);
    }
  }

  /**
   * Build the analysis prompt for Gemini AI
   */
  private buildAnalysisPrompt(resumeText: string, jobRole?: string, jobDescription?: string): string {
    const basePrompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume and provide a comprehensive ATS compatibility score and feedback.

RESUME TEXT:
${resumeText}

${jobRole ? `TARGET JOB ROLE:\n${jobRole}\n` : ''}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "score": <number between 0-100>,
  "strengths": [<array of 3-5 key strengths>],
  "weaknesses": [<array of 3-5 key weaknesses>],
  "suggestions": [<array of 5-8 actionable improvement suggestions>],
  "keywordAnalysis": {
    "found": [<array of important keywords found in resume>],
    "missing": [<array of important keywords missing from resume${jobRole || jobDescription ? ' based on the target role' : ''}>]
  },
  "formatting": {
    "score": <number between 0-100>,
    "issues": [<array of formatting issues that may affect ATS parsing>]
  },
  "sections": [
    {
      "name": "<section name>",
      "present": <boolean>,
      "quality": "<excellent|good|fair|poor|missing>"
    }
  ]
}

Analyze the following aspects:
1. ATS-friendly formatting (simple fonts, clear sections, no tables/graphics)
2. Contact information completeness
3. Section headers (Experience, Education, Skills, etc.)
4. Keyword optimization${jobRole || jobDescription ? ' (match with target role and job description)' : ''}
5. Content quality and relevance${jobRole ? ` for ${jobRole} position` : ''}
6. Quantifiable achievements
7. Action verbs usage
8. Length and conciseness
9. File format compatibility
10. Overall structure and organization

Be specific and actionable in your feedback.`;

    return basePrompt;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiResponse: string): ATSAnalysisResult {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanedResponse);

      // Validate and ensure all required fields exist
      return {
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        keywordAnalysis: {
          found: Array.isArray(parsed.keywordAnalysis?.found) ? parsed.keywordAnalysis.found : [],
          missing: Array.isArray(parsed.keywordAnalysis?.missing) ? parsed.keywordAnalysis.missing : [],
        },
        formatting: {
          score: Math.min(100, Math.max(0, parsed.formatting?.score || 0)),
          issues: Array.isArray(parsed.formatting?.issues) ? parsed.formatting.issues : [],
        },
        sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      };
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      logger.error('AI Response:', aiResponse);
      
      // Return a fallback response
      return {
        score: 50,
        strengths: ['Resume uploaded successfully'],
        weaknesses: ['Unable to perform detailed analysis'],
        suggestions: ['Please try again or contact support'],
        keywordAnalysis: {
          found: [],
          missing: [],
        },
        formatting: {
          score: 50,
          issues: ['Analysis incomplete'],
        },
        sections: [],
      };
    }
  }

  /**
   * Validate file before processing
   */
  validateFile(file: Express.Multer.File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!file) {
      throw new AppError('NO_FILE', 'No file uploaded', 400);
    }

    if (file.size > maxSize) {
      throw new AppError('FILE_TOO_LARGE', 'File size must be less than 5MB', 400);
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError(
        'INVALID_FILE_TYPE',
        'Only PDF and Word documents (.pdf, .doc, .docx) are supported',
        400
      );
    }
  }
}
