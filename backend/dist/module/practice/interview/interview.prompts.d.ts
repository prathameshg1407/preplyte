import { AiInterviewDifficulty, AiInterviewQuestionCategory } from '@prisma/client';
import { StructuredResume, CandidateProfile, ConversationMessage } from './interview.types';
export declare const RESUME_PARSING_PROMPT = "You are an expert resume parser. Extract structured information from the resume text provided.\n\nReturn ONLY valid JSON with this exact structure:\n{\n  \"name\": \"Full Name\",\n  \"email\": \"email@example.com\",\n  \"phone\": \"phone number or empty string\",\n  \"summary\": \"Professional summary if available\",\n  \"skills\": [\"skill1\", \"skill2\", \"skill3\"],\n  \"experience\": [\n    {\n      \"company\": \"Company Name\",\n      \"role\": \"Job Title\",\n      \"duration\": \"Start - End\",\n      \"startDate\": \"YYYY-MM\",\n      \"endDate\": \"YYYY-MM or Present\",\n      \"responsibilities\": [\"responsibility1\", \"responsibility2\"],\n      \"technologies\": [\"tech1\", \"tech2\"]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University Name\",\n      \"degree\": \"Degree Type\",\n      \"field\": \"Field of Study\",\n      \"year\": \"Graduation Year\",\n      \"gpa\": \"GPA if mentioned\"\n    }\n  ],\n  \"projects\": [\n    {\n      \"name\": \"Project Name\",\n      \"description\": \"Brief description\",\n      \"technologies\": [\"tech1\", \"tech2\"],\n      \"highlights\": [\"highlight1\", \"highlight2\"]\n    }\n  ],\n  \"certifications\": [\"certification1\", \"certification2\"],\n  \"achievements\": [\"achievement1\", \"achievement2\"]\n}\n\nExtract as much information as possible. If a field is not available, use empty string or empty array.\nFocus on accuracy over assumptions.";
export declare function buildInterviewerSystemPrompt(resume: StructuredResume, profile: CandidateProfile, difficulty: AiInterviewDifficulty, jobTitle: string, companyName: string | null, focusAreas: string[]): string;
export declare function buildConversationContext(history: ConversationMessage[], questionsAsked: string[], currentTopic: string | null, followUpDepth: number): string;
export declare function buildOpeningPrompt(candidateName: string, jobTitle: string): string;
export declare function buildFollowUpPrompt(previousQuestion: string, candidateAnswer: string, category: AiInterviewQuestionCategory): string;
export declare function buildScoringPrompt(question: string, answer: string, category: AiInterviewQuestionCategory, difficulty: AiInterviewDifficulty, expectedTopics: string[]): string;
export declare function buildFeedbackPrompt(resume: StructuredResume, jobTitle: string, difficulty: AiInterviewDifficulty, responses: Array<{
    question: string;
    answer: string;
    category: AiInterviewQuestionCategory;
    scores: Record<string, number>;
}>): string;
export declare function buildClosingPrompt(candidateName: string): string;
export declare function buildTopicTransitionPrompt(currentTopic: string, nextCategory: AiInterviewQuestionCategory, candidateSkills: string[]): string;
//# sourceMappingURL=interview.prompts.d.ts.map