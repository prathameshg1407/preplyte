// src/module/practice/interview/interview.prompts.ts

import { AiInterviewDifficulty, AiInterviewQuestionCategory } from '@prisma/client';
import { StructuredResume, CandidateProfile, ConversationMessage } from './interview.types';

// =====================================================
// RESUME PARSING PROMPT
// =====================================================

export const RESUME_PARSING_PROMPT = `You are an expert resume parser. Extract structured information from the resume text provided.

Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "summary": "Professional summary if available",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start - End",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "responsibilities": ["responsibility1", "responsibility2"],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "year": "Graduation Year",
      "gpa": "GPA if mentioned"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "highlights": ["highlight1", "highlight2"]
    }
  ],
  "certifications": ["certification1", "certification2"],
  "achievements": ["achievement1", "achievement2"]
}

Extract as much information as possible. If a field is not available, use empty string or empty array.
Focus on accuracy over assumptions.`;

// =====================================================
// QUESTION GENERATION PROMPTS
// =====================================================

export function buildInterviewerSystemPrompt(
  resume: StructuredResume,
  profile: CandidateProfile,
  difficulty: AiInterviewDifficulty,
  jobTitle: string,
  companyName: string | null,
  focusAreas: string[]
): string {
  const companyContext = companyName ? ` at ${companyName}` : '';
  
  return `You are an expert technical interviewer conducting a real interview for a ${jobTitle} position${companyContext}.

## Candidate Profile
- **Name**: ${resume.name}
- **Years of Experience**: ${profile.yearsOfExperience} years
- **Primary Skills**: ${profile.primarySkills.join(', ')}
- **Recent Role**: ${profile.recentRole}
- **Education**: ${resume.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}

## Technical Background
- **Skills**: ${resume.skills.slice(0, 15).join(', ')}
- **Key Projects**: ${resume.projects.slice(0, 3).map(p => p.name).join(', ')}
- **Work Experience**: ${resume.experience.slice(0, 3).map(e => `${e.role} at ${e.company}`).join('; ')}

## Interview Configuration
- **Difficulty Level**: ${difficulty}
- **Focus Areas**: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'General technical and behavioral assessment'}

## Interview Guidelines
1. **Be conversational and natural** - This is a real interview, not an interrogation
2. **Ask ONE question at a time** - Wait for response before continuing
3. **Listen actively** - Reference candidate's previous answers when relevant
4. **Ask follow-ups** - Probe deeper when answers are vague (2-3 follow-ups max per topic)
5. **Be encouraging** - Maintain positive, professional tone
6. **Vary question types** - Mix technical, behavioral, and situational questions
7. **Assess depth** - For ${difficulty} level, expect ${getDifficultyExpectation(difficulty)}

## Question Types to Use
- **Technical**: "Tell me about your experience with [technology from resume]..."
- **Project-based**: "I see you worked on [project]. Walk me through..."
- **Problem-solving**: "How would you approach [relevant scenario]..."
- **Behavioral**: "Tell me about a time when you..."
- **Situational**: "What would you do if..."

## Response Format
Respond with ONLY the next interview question or statement. Be natural and conversational.
Do not include labels like "Question:" or explanations.`;
}

function getDifficultyExpectation(difficulty: AiInterviewDifficulty): string {
  const expectations: Record<AiInterviewDifficulty, string> = {
    ENTRY: 'basic understanding and foundational knowledge',
    MID: 'practical experience and problem-solving ability',
    SENIOR: 'deep expertise, architectural thinking, and leadership',
    LEAD: 'strategic vision, team management, and technical excellence',
  };
  return expectations[difficulty];
}

// =====================================================
// CONVERSATION CONTEXT BUILDER
// =====================================================

export function buildConversationContext(
  history: ConversationMessage[],
  questionsAsked: string[],
  currentTopic: string | null,
  followUpDepth: number
): string {
  const recentHistory = history.slice(-10);
  const historyText = recentHistory
    .map((m) => `${m.role === 'assistant' ? 'INTERVIEWER' : 'CANDIDATE'}: ${m.content}`)
    .join('\n\n');

  return `
## Recent Conversation
${historyText || 'No conversation yet - start with a warm introduction'}

## Topics Already Covered
${questionsAsked.length > 0 ? questionsAsked.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None yet'}

## Current Context
- Current Topic: ${currentTopic || 'Starting interview'}
- Follow-up Depth: ${followUpDepth}/3
- Total Questions Asked: ${questionsAsked.length}

## Next Action
${followUpDepth >= 3 ? 'Move to a new topic' : 'You may ask a follow-up if the previous answer needs clarification'}`;
}

// =====================================================
// OPENING QUESTION PROMPT
// =====================================================

export function buildOpeningPrompt(candidateName: string, jobTitle: string): string {
  return `Start the interview with a warm, professional greeting for ${candidateName} who is interviewing for the ${jobTitle} position.
  
Include:
1. A brief welcome
2. Quick overview of the interview structure
3. An easy opening question to help them relax (about their background or what excites them about this role)

Keep it natural and conversational. Do not be overly formal.`;
}

// =====================================================
// FOLLOW-UP GENERATION PROMPT
// =====================================================

export function buildFollowUpPrompt(
  previousQuestion: string,
  candidateAnswer: string,
  category: AiInterviewQuestionCategory
): string {
  return `Based on the candidate's response, generate an appropriate follow-up.

**Previous Question**: ${previousQuestion}

**Candidate's Answer**: ${candidateAnswer}

**Question Category**: ${category}

Consider:
- Was the answer specific enough?
- Are there interesting points to explore deeper?
- Did they mention any technologies or experiences worth probing?
- For ${category} questions, what would demonstrate deeper competency?

Generate a natural follow-up question that:
1. References their answer directly
2. Probes for more specific details or examples
3. Maintains conversational flow

Return ONLY the follow-up question.`;
}

// =====================================================
// RESPONSE SCORING PROMPT
// =====================================================

export function buildScoringPrompt(
  question: string,
  answer: string,
  category: AiInterviewQuestionCategory,
  difficulty: AiInterviewDifficulty,
  expectedTopics: string[]
): string {
  return `Evaluate this interview response and provide scoring.

**Question**: ${question}
**Category**: ${category}
**Expected Difficulty Level**: ${difficulty}
**Expected Topics**: ${expectedTopics.join(', ')}

**Candidate's Answer**:
${answer}

Score each dimension from 1-10 and provide brief, constructive feedback.

Return ONLY valid JSON:
{
  "scores": {
    "relevance": <1-10>,
    "clarity": <1-10>,
    "depth": <1-10>,
    "technicalAccuracy": <1-10 or null if not applicable>,
    "communication": <1-10>,
    "overall": <1-10>
  },
  "feedback": "<2-3 sentences of constructive feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>"],
  "shouldFollowUp": <true/false>,
  "followUpReason": "<why follow-up is needed or not>"
}`;
}

// =====================================================
// FEEDBACK GENERATION PROMPT
// =====================================================

export function buildFeedbackPrompt(
  resume: StructuredResume,
  jobTitle: string,
  difficulty: AiInterviewDifficulty,
  responses: Array<{
    question: string;
    answer: string;
    category: AiInterviewQuestionCategory;
    scores: Record<string, number>;
  }>
): string {
  const responseSummary = responses
    .map((r, i) => `
Q${i + 1} [${r.category}]: ${r.question}
A: ${r.answer.slice(0, 500)}${r.answer.length > 500 ? '...' : ''}
Scores: Relevance=${r.scores.relevance}, Clarity=${r.scores.clarity}, Depth=${r.scores.depth}
`)
    .join('\n---\n');

  return `Generate comprehensive interview feedback for a ${jobTitle} position (${difficulty} level).

## Candidate Background
- **Name**: ${resume.name}
- **Skills**: ${resume.skills.join(', ')}
- **Experience**: ${resume.experience.map(e => e.role).join(', ')}

## Interview Responses
${responseSummary}

## Required Output
Return ONLY valid JSON matching this structure:
{
  "overallScore": <1-10>,
  "overallSummary": "<3-4 sentence executive summary>",
  "categoryScores": {
    "technical": {
      "score": <1-10>,
      "maxScore": 10,
      "feedback": "<specific technical assessment>"
    },
    "behavioral": {
      "score": <1-10>,
      "maxScore": 10,
      "feedback": "<behavioral competency assessment>"
    },
    "communication": {
      "score": <1-10>,
      "maxScore": 10,
      "feedback": "<communication skills assessment>"
    },
    "problemSolving": {
      "score": <1-10>,
      "maxScore": 10,
      "feedback": "<analytical thinking assessment>"
    },
    "cultureFit": {
      "score": <1-10>,
      "maxScore": 10,
      "feedback": "<culture fit assessment>"
    }
  },
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "areasForImprovement": ["<area1>", "<area2>", "<area3>"],
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>"
  ],
  "hiringRecommendation": "<strong_yes|yes|maybe|no|strong_no>",
  "detailedAnalysis": {
    "technicalDepth": "<analysis of technical knowledge>",
    "communicationStyle": "<analysis of how they communicate>",
    "problemSolvingApproach": "<analysis of problem-solving>",
    "leadershipPotential": "<assessment of leadership qualities>",
    "growthMindset": "<assessment of learning orientation>"
  }
}

Be constructive, specific, and actionable. Base feedback on actual responses.`;
}

// =====================================================
// CLOSING QUESTION PROMPT
// =====================================================

export function buildClosingPrompt(candidateName: string): string {
  return `The interview is wrapping up. Generate a professional closing that:

1. Thanks ${candidateName} for their time
2. Asks if they have any questions for you
3. Briefly explains next steps

Keep it warm and professional. Return ONLY the closing statement.`;
}

// =====================================================
// TOPIC TRANSITION PROMPT
// =====================================================

export function buildTopicTransitionPrompt(
  currentTopic: string,
  nextCategory: AiInterviewQuestionCategory,
  candidateSkills: string[]
): string {
  return `Smoothly transition from discussing "${currentTopic}" to a ${nextCategory} question.

Candidate's relevant skills: ${candidateSkills.join(', ')}

Generate a natural transition that:
1. Acknowledges what was just discussed
2. Introduces the new topic area naturally
3. Asks the first question in the new category

Return ONLY the transition and question combined.`;
}