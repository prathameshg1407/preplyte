import { z } from 'zod';
import { ResumeTemplateCategory } from '@prisma/client';

// ============ Template Validations ============

export const templateFiltersSchema = z.object({
  category: z.nativeEnum(ResumeTemplateCategory).optional(),
  isPremium: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ============ Personal Info ============

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  linkedIn: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  profilePhoto: z.string().url().optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional(),
});

// ============ Summary ============

export const summarySchema = z.object({
  content: z.string().max(2000, 'Summary must be less than 2000 characters'),
});

// ============ Experience ============

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required').max(100),
  position: z.string().min(1, 'Position is required').max(100),
  location: z.string().max(100).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional().default(''),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

export const experienceArraySchema = z.array(experienceItemSchema).max(20);

// ============ Education ============

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution name is required').max(100),
  degree: z.string().min(1, 'Degree is required').max(100),
  field: z.string().min(1, 'Field of study is required').max(100),
  location: z.string().max(100).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().max(10).optional(),
  achievements: z.array(z.string().max(200)).max(5).optional(),
});

export const educationArraySchema = z.array(educationItemSchema).max(10);

// ============ Skills ============

export const skillCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required').max(50),
  skills: z.array(z.string().max(50)).min(1, 'At least one skill is required').max(20),
});

export const skillsArraySchema = z.array(skillCategorySchema).max(10);

// ============ Projects ============

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000),
  technologies: z.array(z.string().max(30)).max(15),
  url: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

export const projectsArraySchema = z.array(projectItemSchema).max(15);

// ============ Certifications ============

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  date: z.string().min(1, 'Date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(50).optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export const certificationsArraySchema = z.array(certificationItemSchema).max(20);

// ============ Languages ============

export const languageItemSchema = z.object({
  id: z.string(),
  language: z.string().min(1, 'Language is required').max(50),
  proficiency: z.enum(['native', 'fluent', 'advanced', 'intermediate', 'basic']),
});

export const languagesArraySchema = z.array(languageItemSchema).max(10);

// ============ Achievements ============

export const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Achievement title is required').max(100),
  description: z.string().max(500).optional(),
  date: z.string().optional(),
  issuer: z.string().max(100).optional(),
});

export const achievementsArraySchema = z.array(achievementItemSchema).max(20);

// ============ Custom Sections ============

export const customSectionItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(100).optional(),
  date: z.string().optional(),
  description: z.string().max(500).optional(),
  bullets: z.array(z.string().max(300)).max(10).optional(),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required').max(50),
  items: z.array(customSectionItemSchema).max(20),
});

export const customSectionsArraySchema = z.array(customSectionSchema).max(5);

// ============ Resume Content ============

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema.optional(),
  summary: summarySchema.optional(),
  experience: experienceArraySchema.optional(),
  education: educationArraySchema.optional(),
  skills: skillsArraySchema.optional(),
  projects: projectsArraySchema.optional(),
  certifications: certificationsArraySchema.optional(),
  languages: languagesArraySchema.optional(),
  achievements: achievementsArraySchema.optional(),
  customSections: customSectionsArraySchema.optional(),
});

// ============ Customization ============

export const resumeCustomizationSchema = z.object({
  sectionOrder: z.array(z.string()).optional(),
  hiddenSections: z.array(z.string()).optional(),
  customStyles: z.record(z.unknown()).optional(),
  colorScheme: z.string().max(50).optional(),
  fontFamily: z.string().max(50).optional(),
});

// ============ API Request Schemas ============

export const createResumeSchema = z.object({
  body: z.object({
    templateId: z.string().min(1, 'Template ID is required'),
    title: z.string().max(100).optional(),
  }),
});

export const updateResumeSchema = z.object({
  body: z.object({
    title: z.string().max(100).optional(),
    templateId: z.string().optional(),
    content: resumeContentSchema.optional(),
    customization: resumeCustomizationSchema.optional(),
  }),
});

export const updateSectionSchema = z.object({
  body: z.object({
    section: z.enum([
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'languages',
      'achievements',
      'customSections',
    ]),
    data: z.unknown(),
  }),
});

export const duplicateResumeSchema = z.object({
  body: z.object({
    newTitle: z.string().max(100).optional(),
  }),
});

export const changeTemplateSchema = z.object({
  body: z.object({
    templateId: z.string().min(1, 'Template ID is required'),
  }),
});

export const resumeFiltersSchema = z.object({
  search: z.string().optional(),
  templateId: z.string().optional(),
  isComplete: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

// ============ ATS Score Checker Schemas ============

export const atsCheckSchema = z.object({
  body: z.object({
    jobDescription: z.string().max(5000).optional(),
  }),
});

// ============ Type Exports ============

export type TemplateFiltersInput = z.infer<typeof templateFiltersSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>['body'];
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>['body'];
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>['body'];
export type DuplicateResumeInput = z.infer<typeof duplicateResumeSchema>['body'];
export type ChangeTemplateInput = z.infer<typeof changeTemplateSchema>['body'];
export type ResumeFiltersInput = z.infer<typeof resumeFiltersSchema>;
export type ATSCheckInput = z.infer<typeof atsCheckSchema>['body'];