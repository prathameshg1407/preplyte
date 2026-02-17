'use client';

import { Resume } from '@/types/resume-builder.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const { template, content, customization } = resume;
  
  // Debug logging
  console.log('ResumePreview rendering with:');
  console.log('- Template:', template.name);
  console.log('- Template styles:', template.styles);
  console.log('- Content:', content);
  
  const styles = customization.customStyles 
    ? { ...template.styles, ...customization.customStyles }
    : template.styles;

  const visibleSections = customization.sectionOrder.filter(
    (s) => !customization.hiddenSections.includes(s)
  );

  // Check if resume has any content - recalculate on every render
  const hasContent = Boolean(
    content.personalInfo || 
    content.summary || 
    (content.experience && content.experience.length > 0) ||
    (content.education && content.education.length > 0) ||
    (content.skills && content.skills.length > 0) ||
    (content.projects && content.projects.length > 0) ||
    (content.certifications && content.certifications.length > 0) ||
    (content.languages && content.languages.length > 0) ||
    (content.achievements && content.achievements.length > 0) ||
    (content.customSections && content.customSections.length > 0)
  );
  
  console.log('hasContent:', hasContent);

  return (
    <div
      data-resume-preview
      className="bg-white shadow-lg mx-auto"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: styles.spacing.padding,
        fontFamily: styles.fontFamily.body,
        fontSize: styles.fontSize.body,
        lineHeight: styles.lineHeight,
        color: styles.textColor,
        backgroundColor: styles.backgroundColor,
      }}
    >
      {!hasContent ? (
        <div className="flex items-center justify-center h-full min-h-[11in]">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Your resume is empty</p>
            <p className="text-sm">Start by filling in your personal information and other sections</p>
          </div>
        </div>
      ) : (
        <>
          {/* Render sections in order */}
          {visibleSections.map((section) => {
            switch (section) {
              case 'personalInfo':
                return content.personalInfo ? (
                  <HeaderSection
                    key={section}
                    personalInfo={content.personalInfo}
                    styles={styles}
                    headerStyle={template.layout.headerStyle}
                  />
                ) : null;
              case 'summary':
                return content.summary?.content ? (
                  <SummarySection
                    key={section}
                    summary={content.summary}
                    styles={styles}
                  />
                ) : null;
              case 'experience':
                return content.experience && content.experience.length > 0 ? (
                  <ExperienceSection
                    key={section}
                    experience={content.experience}
                    styles={styles}
                  />
                ) : null;
              case 'education':
                return content.education && content.education.length > 0 ? (
                  <EducationSection
                    key={section}
                    education={content.education}
                    styles={styles}
                  />
                ) : null;
              case 'skills':
                return content.skills && content.skills.length > 0 ? (
                  <SkillsSection
                    key={section}
                    skills={content.skills}
                    styles={styles}
                  />
                ) : null;
              case 'projects':
                return content.projects && content.projects.length > 0 ? (
                  <ProjectsSection
                    key={section}
                    projects={content.projects}
                    styles={styles}
                  />
                ) : null;
              case 'certifications':
                return content.certifications && content.certifications.length > 0 ? (
                  <CertificationsSection
                    key={section}
                    certifications={content.certifications}
                    styles={styles}
                  />
                ) : null;
              case 'languages':
                return content.languages && content.languages.length > 0 ? (
                  <LanguagesSection
                    key={section}
                    languages={content.languages}
                    styles={styles}
                  />
                ) : null;
              case 'achievements':
                return content.achievements && content.achievements.length > 0 ? (
                  <AchievementsSection
                    key={section}
                    achievements={content.achievements}
                    styles={styles}
                  />
                ) : null;
              case 'customSections':
                return content.customSections && content.customSections.length > 0 ? (
                  <CustomSectionsPreview
                    key={section}
                    customSections={content.customSections}
                    styles={styles}
                  />
                ) : null;
              default:
                return null;
            }
          })}
        </>
      )}
    </div>
  );
}

// Header Section
function HeaderSection({ 
  personalInfo, 
  styles, 
  headerStyle 
}: { 
  personalInfo: any; 
  styles: any;
  headerStyle: string;
}) {
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`;

  return (
    <div
      className={cn(
        'mb-6',
        headerStyle === 'centered' && 'text-center',
        headerStyle === 'left' && 'text-left'
      )}
      style={{ marginBottom: styles.spacing.sectionGap }}
    >
      <h1
        style={{
          fontSize: styles.fontSize.name,
          fontFamily: styles.fontFamily.heading,
          color: styles.primaryColor,
          marginBottom: '4px',
        }}
      >
        {fullName}
      </h1>

      {personalInfo.jobTitle && (
        <p
          style={{
            fontSize: styles.fontSize.sectionTitle,
            color: styles.secondaryColor,
            marginBottom: '12px',
          }}
        >
          {personalInfo.jobTitle}
        </p>
      )}

      <div
        className={cn(
          'flex flex-wrap gap-4',
          headerStyle === 'centered' && 'justify-center',
          headerStyle === 'left' && 'justify-start'
        )}
        style={{ fontSize: styles.fontSize.small, color: styles.textColor }}
      >
        {personalInfo.email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {personalInfo.email}
          </span>
        )}
        {personalInfo.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {personalInfo.phone}
          </span>
        )}
        {personalInfo.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {personalInfo.location}
          </span>
        )}
        {personalInfo.linkedIn && (
          <a
            href={personalInfo.linkedIn}
            className="flex items-center gap-1 hover:underline"
            style={{ color: styles.accentColor }}
          >
            <Linkedin className="h-3 w-3" />
            LinkedIn
          </a>
        )}
        {personalInfo.github && (
          <a
            href={personalInfo.github}
            className="flex items-center gap-1 hover:underline"
            style={{ color: styles.accentColor }}
          >
            <Github className="h-3 w-3" />
            GitHub
          </a>
        )}
        {personalInfo.portfolio && (
          <a
            href={personalInfo.portfolio}
            className="flex items-center gap-1 hover:underline"
            style={{ color: styles.accentColor }}
          >
            <Globe className="h-3 w-3" />
            Portfolio
          </a>
        )}
      </div>
    </div>
  );
}

// Summary Section
function SummarySection({ summary, styles }: { summary: any; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Professional Summary" styles={styles} />
      <p style={{ textAlign: 'justify' }}>{summary.content}</p>
    </section>
  );
}

// Experience Section
function ExperienceSection({ experience, styles }: { experience: any[]; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Work Experience" styles={styles} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.itemGap }}>
        {experience.map((exp) => (
          <div key={exp.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{exp.position}</h3>
                <p style={{ color: styles.secondaryColor }}>{exp.company}</p>
              </div>
              <div className="text-right" style={{ fontSize: styles.fontSize.small }}>
                <p>
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </p>
                {exp.location && <p>{exp.location}</p>}
              </div>
            </div>
            {exp.description && <p className="mt-2">{exp.description}</p>}
            {exp.highlights && exp.highlights.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {exp.highlights.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Education Section
function EducationSection({ education, styles }: { education: any[]; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Education" styles={styles} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.itemGap }}>
        {education.map((edu) => (
          <div key={edu.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                <p style={{ color: styles.secondaryColor }}>{edu.institution}</p>
              </div>
              <div className="text-right" style={{ fontSize: styles.fontSize.small }}>
                <p>
                  {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                </p>
                {edu.gpa && <p>GPA: {edu.gpa}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Skills Section
function SkillsSection({ skills, styles }: { skills: any[]; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Skills" styles={styles} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {skills.map((category) => (
          <div key={category.id} className="flex flex-wrap items-start gap-2">
            <span className="font-semibold min-w-[120px]">{category.name}:</span>
            <span>{category.skills.join(' • ')}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Projects Section
function ProjectsSection({ projects, styles }: { projects: any[]; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Projects" styles={styles} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.itemGap }}>
        {projects.map((project) => (
          <div key={project.id}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{project.name}</h3>
              {project.url && (
                <a href={project.url} style={{ color: styles.accentColor }}>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {project.github && (
                <a href={project.github} style={{ color: styles.accentColor }}>
                  <Github className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="mt-1">{project.description}</p>
            {project.technologies.length > 0 && (
              <p className="mt-1" style={{ fontSize: styles.fontSize.small }}>
                <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Certifications Section
function CertificationsSection({ certifications, styles }: { certifications: any[]; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Certifications" styles={styles} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {certifications.map((cert) => (
          <div key={cert.id} className="flex justify-between">
            <span>
              <span className="font-medium">{cert.name}</span>
              <span className="mx-2">-</span>
              <span>{cert.issuer}</span>
            </span>
            <span style={{ fontSize: styles.fontSize.small }}>{formatDate(cert.date)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Languages Section
function LanguagesSection({ languages, styles }: { languages: any[]; styles: any }) {
  const proficiencyLabels = {
    native: 'Native',
    fluent: 'Fluent',
    advanced: 'Advanced',
    intermediate: 'Intermediate',
    basic: 'Basic',
  };

  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Languages" styles={styles} />
      <div className="flex flex-wrap gap-4">
        {languages.map((lang) => (
          <span key={lang.id}>
            <span className="font-medium">{lang.language}</span>
            <span className="mx-1">-</span>
            <span>{proficiencyLabels[lang.proficiency as keyof typeof proficiencyLabels]}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

// Achievements Section
function AchievementsSection({ achievements, styles }: { achievements: any[]; styles: any }) {
  return (
    <section style={{ marginBottom: styles.spacing.sectionGap }}>
      <SectionTitle title="Achievements & Awards" styles={styles} />
      <ul className="list-disc list-inside space-y-1">
        {achievements.map((achievement) => (
          <li key={achievement.id}>
            <span className="font-medium">{achievement.title}</span>
            {achievement.issuer && <span> - {achievement.issuer}</span>}
            {achievement.date && (
              <span style={{ fontSize: styles.fontSize.small }}> ({formatDate(achievement.date)})</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Section Title Component
function SectionTitle({ title, styles }: { title: string; styles: any }) {
  return (
    <h2
      style={{
        fontSize: styles.fontSize.sectionTitle,
        fontFamily: styles.fontFamily.heading,
        color: styles.primaryColor,
        borderBottom: `2px solid ${styles.primaryColor}`,
        paddingBottom: '4px',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}
    >
      {title}
    </h2>
  );
}

// Custom Sections Preview
function CustomSectionsPreview({ customSections, styles }: { customSections: any[]; styles: any }) {
  return (
    <>
      {customSections.map((section) => (
        <section key={section.id} style={{ marginBottom: styles.spacing.sectionGap }}>
          <SectionTitle title={section.title} styles={styles} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.itemGap }}>
            {section.items.map((item: any) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.subtitle && (
                      <p style={{ color: styles.secondaryColor }}>{item.subtitle}</p>
                    )}
                  </div>
                  {item.date && (
                    <div className="text-right" style={{ fontSize: styles.fontSize.small }}>
                      <p>{item.date}</p>
                    </div>
                  )}
                </div>
                {item.description && <p className="mt-2">{item.description}</p>}
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {item.bullets.map((bullet: string, i: number) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

// Helper function
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'MMM yyyy');
  } catch {
    return dateString;
  }
}