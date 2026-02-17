import React from 'react';
import { ResumeTemplate } from '@/types/resume.types';

interface TemplatePreviewProps {
  template: ResumeTemplate;
  className?: string;
}

// Mock data for preview
const mockData = {
  personalInfo: {
    firstName: 'Swaranjith',
    lastName: 'Gudelli',
    email: 'swarangudelli@email.com',
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    jobTitle: 'Software Engineer',
  },
  summary: {
    content: 'Experienced software engineer with 5+ years of expertise in full-stack development.',
  },
  experience: [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      endDate: '2024-01',
      current: false,
      description: 'Led development of key features',
      highlights: ['Built scalable systems', 'Mentored junior developers'],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'VPPCOE&VA',
      degree: 'BE',
      field: 'Information Technology',
      startDate: '2022',
      endDate: '2026',
      current: false,
      gpa: '7.2',
    },
  ],
  skills: [
    {
      id: '1',
      name: 'Technical Skills',
      skills: ['JavaScript', 'React', 'Node.js', 'Java', 'SQL'],
    },
  ],
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, className = '' }) => {
  const { styles, layout } = template;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily.body,
        fontSize: styles.fontSize.body,
        lineHeight: styles.lineHeight,
        color: styles.textColor,
      }}
    >
      <div style={{ padding: styles.spacing.padding, transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}>
        {/* Header */}
        <div
          style={{
            textAlign: layout.headerStyle === 'centered' ? 'center' : 'left',
            marginBottom: styles.spacing.sectionGap,
          }}
        >
          <h1
            style={{
              fontSize: styles.fontSize.name,
              fontFamily: styles.fontFamily.heading,
              color: styles.primaryColor,
              fontWeight: 'bold',
              marginBottom: '8px',
            }}
          >
            {mockData.personalInfo.firstName} {mockData.personalInfo.lastName}
          </h1>
          <p style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor, marginBottom: '4px' }}>
            {mockData.personalInfo.jobTitle}
          </p>
          <p style={{ fontSize: styles.fontSize.small, color: styles.textColor }}>
            {mockData.personalInfo.email} • {mockData.personalInfo.phone}
          </p>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2
            style={{
              fontSize: styles.fontSize.sectionTitle,
              fontFamily: styles.fontFamily.heading,
              color: styles.primaryColor,
              fontWeight: 'bold',
              marginBottom: styles.spacing.itemGap,
              borderBottom: `2px solid ${styles.accentColor}`,
              paddingBottom: '4px',
            }}
          >
            SUMMARY
          </h2>
          <p style={{ fontSize: styles.fontSize.body }}>{mockData.summary.content}</p>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2
            style={{
              fontSize: styles.fontSize.sectionTitle,
              fontFamily: styles.fontFamily.heading,
              color: styles.primaryColor,
              fontWeight: 'bold',
              marginBottom: styles.spacing.itemGap,
              borderBottom: `2px solid ${styles.accentColor}`,
              paddingBottom: '4px',
            }}
          >
            EXPERIENCE
          </h2>
          {mockData.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: styles.spacing.itemGap }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor }}>
                  {exp.position}
                </strong>
                <span style={{ fontSize: styles.fontSize.small, color: styles.textColor }}>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <p style={{ fontSize: styles.fontSize.small, color: styles.secondaryColor, marginBottom: '4px' }}>
                {exp.company} • {exp.location}
              </p>
              <p style={{ fontSize: styles.fontSize.small }}>{exp.description}</p>
            </div>
          ))}
        </div>

        {/* Education */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2
            style={{
              fontSize: styles.fontSize.sectionTitle,
              fontFamily: styles.fontFamily.heading,
              color: styles.primaryColor,
              fontWeight: 'bold',
              marginBottom: styles.spacing.itemGap,
              borderBottom: `2px solid ${styles.accentColor}`,
              paddingBottom: '4px',
            }}
          >
            EDUCATION
          </h2>
          {mockData.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: styles.spacing.itemGap }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor }}>
                  {edu.degree} in {edu.field}
                </strong>
                <span style={{ fontSize: styles.fontSize.small, color: styles.textColor }}>
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <p style={{ fontSize: styles.fontSize.small, color: styles.secondaryColor }}>
                {edu.institution} • GPA: {edu.gpa}
              </p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <h2
            style={{
              fontSize: styles.fontSize.sectionTitle,
              fontFamily: styles.fontFamily.heading,
              color: styles.primaryColor,
              fontWeight: 'bold',
              marginBottom: styles.spacing.itemGap,
              borderBottom: `2px solid ${styles.accentColor}`,
              paddingBottom: '4px',
            }}
          >
            SKILLS
          </h2>
          {mockData.skills.map((skillGroup) => (
            <div key={skillGroup.id}>
              <p style={{ fontSize: styles.fontSize.small }}>
                {skillGroup.skills.join(' • ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Badge */}
      {template.isPremium && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: styles.primaryColor,
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        >
          PREMIUM
        </div>
      )}
    </div>
  );
};
