import { ResumeTemplateCategory } from '@prisma/client';

// ============ Template Types ============

export interface TemplateLayout {
  sections: TemplateSectionConfig[];
  columns: 1 | 2;
  headerStyle: 'centered' | 'left' | 'split';
  sidebarPosition?: 'left' | 'right';
}

export interface TemplateSectionConfig {
  id: string;
  name: string;
  type: ResumeSectionType;
  required: boolean;
  maxItems?: number;
  defaultVisible: boolean;
}

export interface TemplateStyles {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: {
    heading: string;
    body: string;
  };
  fontSize: {
    name: string;
    sectionTitle: string;
    body: string;
    small: string;
  };
  spacing: {
    sectionGap: string;
    itemGap: string;
    padding: string;
  };
  borderRadius: string;
  lineHeight: string;
}

export interface ResumeTemplateResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  category: ResumeTemplateCategory;
  layout: TemplateLayout;
  styles: TemplateStyles;
  isPremium: boolean;
  popularity: number;
}

// ============ Resume Content Types ============

export type ResumeSectionType = 
  | 'personalInfo'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'achievements'
  | 'customSections';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  github?: string;
  profilePhoto?: string;
  jobTitle?: string;
}

export interface Summary {
  content: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  issuer?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  bullets?: string[];
}

export interface ResumeContent {
  personalInfo?: PersonalInfo;
  summary?: Summary;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: SkillCategory[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  languages?: LanguageItem[];
  achievements?: AchievementItem[];
  customSections?: CustomSection[];
}

export interface ResumeCustomization {
  sectionOrder: string[];
  hiddenSections: string[];
  customStyles?: Partial<TemplateStyles>;
  colorScheme?: string;
  fontFamily?: string;
}

// ============ API Request/Response Types ============

export interface CreateResumeRequest {
  templateId: string;
  title?: string;
}

export interface UpdateResumeRequest {
  title?: string;
  templateId?: string;
  content?: Partial<ResumeContent>;
  customization?: Partial<ResumeCustomization>;
}

export interface UpdateResumeSectionRequest {
  section: ResumeSectionType;
  data: unknown;
}

export interface ResumeResponse {
  id: string;
  title: string;
  slug: string | null;
  template: ResumeTemplateResponse;
  content: ResumeContent;
  customization: ResumeCustomization;
  isComplete: boolean;
  lastAtsScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListItem {
  id: string;
  title: string;
  slug: string | null;
  templateId: string;
  templateName: string;
  templateThumbnail: string | null;
  isComplete: boolean;
  lastAtsScore: number | null;
  updatedAt: string;
  content: ResumeContent;
  templateStyles: TemplateStyles;
  templateLayout: TemplateLayout;
}

export interface ResumeVersionResponse {
  id: string;
  version: number;
  changeNote: string | null;
  createdAt: string;
}

export interface DuplicateResumeRequest {
  newTitle?: string;
}

export interface ChangeTemplateRequest {
  templateId: string;
}

// ============ Filter/Query Types ============

export interface TemplateFilters {
  category?: ResumeTemplateCategory;
  isPremium?: boolean;
  search?: string;
}

export interface ResumeFilters {
  search?: string;
  templateId?: string;
  isComplete?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============ ATS Score Checker Types ============

export interface ATSCheckRequest {
  jobDescription?: string;
}

export interface ATSCheckResponse {
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
  analyzedAt: string;
}