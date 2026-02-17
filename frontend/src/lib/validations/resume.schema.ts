import { z } from 'zod';

// Personal Info
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional(),
});

// Summary
export const summarySchema = z.object({
  content: z.string().max(2000, 'Summary must be less than 2000 characters'),
});

// Experience
export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required').max(100),
  position: z.string().min(1, 'Position is required').max(100),
  location: z.string().max(100).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional(),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

// Education
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

// Skills
export const skillCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required').max(50),
  skills: z.array(z.string().max(50)).min(1, 'At least one skill is required').max(20),
});

// Projects
export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000),
  technologies: z.array(z.string().max(30)).max(15),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

// Certifications
export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  date: z.string().min(1, 'Date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(50).optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// Languages
export const languageItemSchema = z.object({
  id: z.string(),
  language: z.string().min(1, 'Language is required').max(50),
  proficiency: z.enum(['native', 'fluent', 'advanced', 'intermediate', 'basic']),
});

// Achievements
export const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Achievement title is required').max(100),
  description: z.string().max(500).optional(),
  date: z.string().optional(),
  issuer: z.string().max(100).optional(),
});

// Custom Sections
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

// Resume Content
export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema.optional(),
  summary: summarySchema.optional(),
  experience: z.array(experienceItemSchema).optional(),
  education: z.array(educationItemSchema).optional(),
  skills: z.array(skillCategorySchema).optional(),
  projects: z.array(projectItemSchema).optional(),
  certifications: z.array(certificationItemSchema).optional(),
  languages: z.array(languageItemSchema).optional(),
  achievements: z.array(achievementItemSchema).optional(),
  customSections: z.array(customSectionSchema).optional(),
});

// Resume Customization
export const resumeCustomizationSchema = z.object({
  sectionOrder: z.array(z.string()),
  hiddenSections: z.array(z.string()),
  customStyles: z.record(z.unknown()).optional(),
  colorScheme: z.string().optional(),
  fontFamily: z.string().optional(),
});

// Create Resume
export const createResumeSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  title: z.string().max(100).optional(),
});

// Update Resume
export const updateResumeSchema = z.object({
  title: z.string().max(100).optional(),
  templateId: z.string().optional(),
  content: resumeContentSchema.optional(),
  customization: resumeCustomizationSchema.partial().optional(),
});