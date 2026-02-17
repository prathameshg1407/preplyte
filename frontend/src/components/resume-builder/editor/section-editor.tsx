'use client';

import { Resume, ResumeSectionType } from '@/types/resume-builder.types';
import { PersonalInfoEditor } from './sections/personal-info-editor';
import { SummaryEditor } from './sections/summary-editor';
import { ExperienceEditor } from './sections/experience-editor';
import { EducationEditor } from './sections/education.editor';
import { SkillsEditor } from './sections/skills-editor';
import { ProjectsEditor } from './sections/projects-editor';
import { CertificationsEditor } from './sections/certifications-editor';
import { LanguagesEditor } from './sections/languages.editor';
import { AchievementsEditor } from './sections/achievements-editor';
import { CustomSectionsEditor } from './sections/custom-sections-editor';

interface SectionEditorProps {
  section: ResumeSectionType;
  resume: Resume;
  onSave: (section: ResumeSectionType, data: unknown) => Promise<void>;
}

export function SectionEditor({ section, resume, onSave }: SectionEditorProps) {
  const commonProps = {
    resume,
    onSave: (data: unknown) => onSave(section, data),
  };

  switch (section) {
    case 'personalInfo':
      return <PersonalInfoEditor {...commonProps} />;
    case 'summary':
      return <SummaryEditor {...commonProps} />;
    case 'experience':
      return <ExperienceEditor {...commonProps} />;
    case 'education':
      return <EducationEditor {...commonProps} />;
    case 'skills':
      return <SkillsEditor {...commonProps} />;
    case 'projects':
      return <ProjectsEditor {...commonProps} />;
    case 'certifications':
      return <CertificationsEditor {...commonProps} />;
    case 'languages':
      return <LanguagesEditor {...commonProps} />;
    case 'achievements':
      return <AchievementsEditor {...commonProps} />;
    case 'customSections':
      return <CustomSectionsEditor {...commonProps} />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Section editor not available
        </div>
      );
  }
}