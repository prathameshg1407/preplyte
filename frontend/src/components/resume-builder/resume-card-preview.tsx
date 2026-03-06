'use client';

import { ResumeContent, TemplateStyles } from '@/types/resume-builder.types';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ResumeCardPreviewProps {
  content: ResumeContent;
  styles: TemplateStyles;
  headerStyle?: 'centered' | 'left' | 'split';
}

export function ResumeCardPreview({ 
  content, 
  styles,
  headerStyle = 'left' 
}: ResumeCardPreviewProps) {
  // Check what sections have content
  const hasPersonalInfo = content.personalInfo && 
    (content.personalInfo.firstName || content.personalInfo.lastName);
  const hasSummary = content.summary?.content;
  const hasExperience = content.experience && content.experience.length > 0;
  const hasEducation = content.education && content.education.length > 0;
  const hasSkills = content.skills && content.skills.length > 0;

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily.body,
        fontSize: '6px',
        lineHeight: '1.2',
        color: styles.textColor,
        padding: '8px',
      }}
    >
      {/* Personal Info Header */}
      {hasPersonalInfo && (
        <div
          className={cn(
            'mb-2',
            headerStyle === 'centered' && 'text-center',
            headerStyle === 'left' && 'text-left'
          )}
        >
          <h1
            style={{
              fontSize: '10px',
              fontFamily: styles.fontFamily.heading,
              color: styles.primaryColor,
              fontWeight: 'bold',
              marginBottom: '2px',
            }}
          >
            {content.personalInfo?.firstName} {content.personalInfo?.lastName}
          </h1>

          {content.personalInfo?.jobTitle && (
            <p
              style={{
                fontSize: '7px',
                color: styles.secondaryColor,
                marginBottom: '2px',
              }}
            >
              {content.personalInfo.jobTitle}
            </p>
          )}

          <div
            className={cn(
              'flex flex-wrap gap-1 text-[5px]',
              headerStyle === 'centered' && 'justify-center',
              headerStyle === 'left' && 'justify-start'
            )}
          >
            {content.personalInfo?.email && (
              <span className="flex items-center gap-0.5">
                <Mail className="h-2 w-2" />
                <span className="truncate max-w-[60px]">{content.personalInfo.email}</span>
              </span>
            )}
            {content.personalInfo?.phone && (
              <span className="flex items-center gap-0.5">
                <Phone className="h-2 w-2" />
                {content.personalInfo.phone}
              </span>
            )}
            {content.personalInfo?.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-2 w-2" />
                <span className="truncate max-w-[60px]">{content.personalInfo.location}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {hasSummary && (
        <div className="mb-2">
          <SectionTitle title="Summary" styles={styles} />
          <p className="line-clamp-2 text-[5px]">
            {content.summary?.content}
          </p>
        </div>
      )}

      {/* Experience */}
      {hasExperience && (
        <div className="mb-2">
          <SectionTitle title="Experience" styles={styles} />
          <div className="space-y-1">
            {content.experience?.slice(0, 2).map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[6px] truncate">{exp.position}</p>
                    <p className="text-[5px] truncate" style={{ color: styles.secondaryColor }}>
                      {exp.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {hasEducation && (
        <div className="mb-2">
          <SectionTitle title="Education" styles={styles} />
          <div className="space-y-1">
            {content.education?.slice(0, 2).map((edu) => (
              <div key={edu.id}>
                <p className="font-semibold text-[6px] truncate">{edu.degree}</p>
                <p className="text-[5px] truncate" style={{ color: styles.secondaryColor }}>
                  {edu.institution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {hasSkills && (
        <div className="mb-2">
          <SectionTitle title="Skills" styles={styles} />
          <div className="space-y-0.5">
            {content.skills?.slice(0, 2).map((category) => (
              <div key={category.id} className="text-[5px]">
                <span className="font-semibold">{category.name}:</span>{' '}
                <span className="truncate">{category.skills.slice(0, 3).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasPersonalInfo && !hasSummary && !hasExperience && !hasEducation && !hasSkills && (
        <div className="flex items-center justify-center h-full">
          <p className="text-[8px] text-muted-foreground text-center">
            Empty Resume
          </p>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title, styles }: { title: string; styles: TemplateStyles }) {
  return (
    <h2
      style={{
        fontSize: '7px',
        fontFamily: styles.fontFamily.heading,
        color: styles.primaryColor,
        borderBottom: `1px solid ${styles.primaryColor}`,
        paddingBottom: '1px',
        marginBottom: '2px',
        textTransform: 'uppercase',
        fontWeight: 'bold',
      }}
    >
      {title}
    </h2>
  );
}
