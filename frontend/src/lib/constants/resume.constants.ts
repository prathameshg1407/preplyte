import { ResumeTemplateCategory, ResumeSectionType } from '@/types/resume.types';

export const TEMPLATE_CATEGORIES: { value: ResumeTemplateCategory; label: string }[] = [
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'MODERN', label: 'Modern' },
  { value: 'MINIMAL', label: 'Minimal' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'TECHNICAL', label: 'Technical' },
];

export const SECTION_LABELS: Record<ResumeSectionType, string> = {
  personalInfo: 'Personal Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  achievements: 'Achievements & Awards',
  customSections: 'Custom Sections',
};

export const DEFAULT_SECTION_ORDER: ResumeSectionType[] = [
  'personalInfo',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'achievements',
];

export const PROFICIENCY_LEVELS = [
  { value: 'native', label: 'Native', description: 'First language' },
  { value: 'fluent', label: 'Fluent', description: 'Full professional proficiency' },
  { value: 'advanced', label: 'Advanced', description: 'Professional working proficiency' },
  { value: 'intermediate', label: 'Intermediate', description: 'Limited working proficiency' },
  { value: 'basic', label: 'Basic', description: 'Elementary proficiency' },
] as const;

export const COMMON_SKILLS = {
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
  ],
  'Frontend': [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Sass', 'Tailwind CSS',
  ],
  'Backend': [
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'NestJS',
  ],
  'Databases': [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase',
  ],
  'DevOps & Cloud': [
    'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform',
  ],
  'Tools': [
    'Git', 'GitHub', 'GitLab', 'Jira', 'Figma', 'VS Code', 'Postman',
  ],
};

export const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin Chinese', 'Japanese',
  'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic', 'Hindi', 'Dutch',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Turkish', 'Vietnamese',
];

export const DEGREE_OPTIONS = [
  'Bachelor of Science (B.S.)',
  'Bachelor of Arts (B.A.)',
  'Bachelor of Engineering (B.E.)',
  'Bachelor of Technology (B.Tech)',
  'Master of Science (M.S.)',
  'Master of Arts (M.A.)',
  'Master of Engineering (M.E.)',
  'Master of Business Administration (MBA)',
  'Doctor of Philosophy (Ph.D.)',
  'Doctor of Medicine (M.D.)',
  'Juris Doctor (J.D.)',
  'Associate Degree',
  'High School Diploma',
  'GED',
  'Certificate',
  'Diploma',
];

export const POPULAR_CERTIFICATIONS = [
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
  { name: 'AWS Certified Developer', issuer: 'Amazon Web Services' },
  { name: 'Google Cloud Professional Cloud Architect', issuer: 'Google Cloud' },
  { name: 'Microsoft Azure Administrator', issuer: 'Microsoft' },
  { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF' },
  { name: 'PMP (Project Management Professional)', issuer: 'PMI' },
  { name: 'Certified Scrum Master (CSM)', issuer: 'Scrum Alliance' },
  { name: 'CompTIA Security+', issuer: 'CompTIA' },
  { name: 'Cisco CCNA', issuer: 'Cisco' },
  { name: 'Google Analytics Certification', issuer: 'Google' },
];

export const CUSTOM_SECTION_SUGGESTIONS = [
  'Volunteer Experience',
  'Publications',
  'Presentations',
  'Research',
  'Interests & Hobbies',
  'References',
  'Professional Memberships',
  'Conferences',
  'Patents',
  'Open Source Contributions',
];