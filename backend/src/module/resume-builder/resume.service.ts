import { Prisma, PrismaClient, ResumeTemplateCategory } from '@prisma/client';
import { 
  ResumeTemplateResponse, 
  ResumeResponse, 
  ResumeListItem,
  ResumeContent,
  ResumeCustomization,
  TemplateLayout,
  TemplateStyles,
  ResumeVersionResponse,
  ResumeSectionType,
} from './resume.types';
import {
  CreateResumeInput,
  UpdateResumeInput,
  TemplateFiltersInput,
  ResumeFiltersInput,
  DuplicateResumeInput,
} from './resume.validation';
import { AppError } from '../../utils/errors';
import { prisma } from '../../lib/db';
import { generateSlug } from '../../utils/helpers';

export class ResumeService {
  constructor() {}

  // ============ Template Methods ============

  async getTemplates(filters: TemplateFiltersInput): Promise<ResumeTemplateResponse[]> {
    const where: any = {
      isActive: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isPremium !== undefined) {
      where.isPremium = filters.isPremium;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.resumeTemplate.findMany({
      where,
      orderBy: [
        { popularity: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return templates.map(this.mapTemplateToResponse);
  }

  async getTemplateById(templateId: string): Promise<ResumeTemplateResponse> {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new AppError('NOT_FOUND', 'Template not found', 404);
    }

    return this.mapTemplateToResponse(template);
  }

  async getTemplateBySlug(slug: string): Promise<ResumeTemplateResponse> {
    const template = await prisma.resumeTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      throw new AppError('NOT_FOUND', 'Template not found', 404);
    }

    return this.mapTemplateToResponse(template);
  }

  async getTemplateCategories(): Promise<{ category: ResumeTemplateCategory; count: number }[]> {
    const categories = await prisma.resumeTemplate.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
    });

    return categories.map(c => ({
      category: c.category,
      count: c._count.id,
    }));
  }

  // ============ Resume CRUD Methods ============

  async createResume(userId: string, data: CreateResumeInput): Promise<ResumeResponse> {
    // Verify template exists
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new AppError('NOT_FOUND', 'Template not found', 404);
    }

    // Generate unique slug
    const title = data.title || 'Untitled Resume';
    const baseSlug = generateSlug(title);
    const slug = await this.generateUniqueSlug(userId, baseSlug);

    // Create resume with default section order from template
    const layout = template.layout as unknown as TemplateLayout;
    const defaultSectionOrder = layout.sections
      .filter(s => s.defaultVisible)
      .map(s => s.type);

    const resume = await prisma.userResume.create({
      data: {
        userId,
        templateId: data.templateId,
        title,
        slug,
        sectionOrder: defaultSectionOrder,
        hiddenSections: [],
      },
      include: {
        template: true,
      },
    });

    // Increment template popularity
    await prisma.resumeTemplate.update({
      where: { id: data.templateId },
      data: { popularity: { increment: 1 } },
    });

    return this.mapResumeToResponse(resume);
  }

  async getUserResumes(
    userId: string, 
    filters: ResumeFiltersInput
  ): Promise<{ resumes: ResumeListItem[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search, templateId, isComplete } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (templateId) {
      where.templateId = templateId;
    }

    if (isComplete !== undefined) {
      where.isComplete = isComplete;
    }

    const [resumes, total] = await Promise.all([
      prisma.userResume.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              thumbnail: true,
              styles: true,
              layout: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userResume.count({ where }),
    ]);

    return {
      resumes: resumes.map(r => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        templateId: r.templateId,
        templateName: r.template.name,
        templateThumbnail: r.template.thumbnail,
        isComplete: r.isComplete,
        lastAtsScore: r.lastAtsScore,
        updatedAt: r.updatedAt.toISOString(),
        content: {
          personalInfo: r.personalInfo || undefined,
          summary: r.summary || undefined,
          experience: r.experience || undefined,
          education: r.education || undefined,
          skills: r.skills || undefined,
          projects: r.projects || undefined,
          certifications: r.certifications || undefined,
          languages: r.languages || undefined,
          achievements: r.achievements || undefined,
          customSections: r.customSections || undefined,
        } as ResumeContent,
        templateStyles: r.template.styles as TemplateStyles,
        templateLayout: r.template.layout as TemplateLayout,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getResumeById(userId: string, resumeId: string): Promise<ResumeResponse> {
    const resume = await prisma.userResume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
      include: {
        template: true,
      },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    return this.mapResumeToResponse(resume);
  }

  async getResumeBySlug(userId: string, slug: string): Promise<ResumeResponse> {
    const resume = await prisma.userResume.findFirst({
      where: {
        slug,
        userId,
      },
      include: {
        template: true,
      },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    return this.mapResumeToResponse(resume);
  }

  async updateResume(
    userId: string, 
    resumeId: string, 
    data: UpdateResumeInput
  ): Promise<ResumeResponse> {
    const existingResume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!existingResume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    // If changing template, verify it exists
    if (data.templateId && data.templateId !== existingResume.templateId) {
      const template = await prisma.resumeTemplate.findUnique({
        where: { id: data.templateId },
      });

      if (!template) {
        throw new AppError('NOT_FOUND', 'Template not found', 404);
      }
    }

    // Build update data
    const updateData: any = {};

    if (data.title) {
      updateData.title = data.title;
      updateData.slug = await this.generateUniqueSlug(userId, generateSlug(data.title), resumeId);
    }

    if (data.templateId) {
      updateData.templateId = data.templateId;
    }

    if (data.content) {
      if (data.content.personalInfo) updateData.personalInfo = data.content.personalInfo;
      if (data.content.summary) updateData.summary = data.content.summary;
      if (data.content.experience) updateData.experience = data.content.experience;
      if (data.content.education) updateData.education = data.content.education;
      if (data.content.skills) updateData.skills = data.content.skills;
      if (data.content.projects) updateData.projects = data.content.projects;
      if (data.content.certifications) updateData.certifications = data.content.certifications;
      if (data.content.languages) updateData.languages = data.content.languages;
      if (data.content.achievements) updateData.achievements = data.content.achievements;
      if (data.content.customSections) updateData.customSections = data.content.customSections;
    }

    if (data.customization) {
      if (data.customization.sectionOrder) updateData.sectionOrder = data.customization.sectionOrder;
      if (data.customization.hiddenSections) updateData.hiddenSections = data.customization.hiddenSections;
      if (data.customization.customStyles) updateData.customStyles = data.customization.customStyles;
      if (data.customization.colorScheme) updateData.colorScheme = data.customization.colorScheme;
      if (data.customization.fontFamily) updateData.fontFamily = data.customization.fontFamily;
    }

    // Calculate completion status
    updateData.isComplete = this.calculateCompletionStatus(existingResume, data.content);

    const resume = await prisma.userResume.update({
      where: { id: resumeId },
      data: updateData,
      include: { template: true },
    });

    return this.mapResumeToResponse(resume);
  }

  async updateResumeSection(
    userId: string,
    resumeId: string,
    section: ResumeSectionType,
    data: unknown
  ): Promise<ResumeResponse> {
    const existingResume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!existingResume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    // Create version snapshot before update
    await this.createVersionSnapshot(resumeId, `Updated ${section}`);

    const updateData: any = {
      [section]: data,
    };

    // Recalculate completion status
    const contentUpdate = { [section]: data };
    updateData.isComplete = this.calculateCompletionStatus(existingResume, contentUpdate);

    // Handle customSections in sectionOrder
    if (section === 'customSections') {
      const customSections = data as any[];
      const currentOrder = existingResume.sectionOrder as string[];
      
      if (customSections && customSections.length > 0) {
        // Add customSections to sectionOrder if not present
        if (!currentOrder.includes('customSections')) {
          updateData.sectionOrder = [...currentOrder, 'customSections'];
        }
      } else {
        // Remove customSections from sectionOrder if empty
        if (currentOrder.includes('customSections')) {
          updateData.sectionOrder = currentOrder.filter(s => s !== 'customSections');
        }
      }
    }

    const resume = await prisma.userResume.update({
      where: { id: resumeId },
      data: updateData,
      include: { template: true },
    });

    return this.mapResumeToResponse(resume);
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const resume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    await prisma.userResume.delete({
      where: { id: resumeId },
    });
  }

  async duplicateResume(
    userId: string, 
    resumeId: string, 
    data: DuplicateResumeInput
  ): Promise<ResumeResponse> {
    const original = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
      include: { template: true },
    });

    if (!original) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    const title = data.newTitle || `${original.title} (Copy)`;
    const slug = await this.generateUniqueSlug(userId, generateSlug(title));

    const duplicate = await prisma.userResume.create({
      data: {
        userId,
        templateId: original.templateId,
        title,
        slug,
        personalInfo: original.personalInfo || undefined,
        summary: original.summary || undefined,
        experience: original.experience || undefined,
        education: original.education || undefined,
        skills: original.skills || undefined,
        projects: original.projects || undefined,
        certifications: original.certifications || undefined,
        languages: original.languages || undefined,
        achievements: original.achievements || undefined,
        customSections: original.customSections || undefined,
        sectionOrder: original.sectionOrder,
        hiddenSections: original.hiddenSections,
        customStyles: original.customStyles || undefined,
        colorScheme: original.colorScheme,
        fontFamily: original.fontFamily,
        isComplete: original.isComplete,
      },
      include: { template: true },
    });

    return this.mapResumeToResponse(duplicate);
  }

  async changeTemplate(
    userId: string,
    resumeId: string,
    templateId: string
  ): Promise<ResumeResponse> {
    const resume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new AppError('NOT_FOUND', 'Template not found', 404);
    }

    // Create version before template change
    await this.createVersionSnapshot(resumeId, 'Changed template');

    const updatedResume = await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        templateId,
        // Reset custom styles when changing template
        customStyles: Prisma.JsonNull,
        colorScheme: null,
        fontFamily: null,
      },
      include: { template: true },
    });

    return this.mapResumeToResponse(updatedResume);
  }

  // ============ Version History Methods ============

  async getResumeVersions(userId: string, resumeId: string): Promise<ResumeVersionResponse[]> {
    const resume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    const versions = await prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { version: 'desc' },
      take: 20, // Limit to last 20 versions
    });

    return versions.map(v => ({
      id: v.id,
      version: v.version,
      changeNote: v.changeNote,
      createdAt: v.createdAt.toISOString(),
    }));
  }

  async restoreVersion(
    userId: string, 
    resumeId: string, 
    versionId: string
  ): Promise<ResumeResponse> {
    const resume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId },
    });

    if (!version) {
      throw new AppError('NOT_FOUND', 'Version not found', 404);
    }

    // Create snapshot of current state before restore
    await this.createVersionSnapshot(resumeId, 'Before restore');

    const versionData = version.data as any;

    const updatedResume = await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        personalInfo: versionData.personalInfo,
        summary: versionData.summary,
        experience: versionData.experience,
        education: versionData.education,
        skills: versionData.skills,
        projects: versionData.projects,
        certifications: versionData.certifications,
        languages: versionData.languages,
        achievements: versionData.achievements,
        customSections: versionData.customSections,
        sectionOrder: versionData.sectionOrder,
        hiddenSections: versionData.hiddenSections,
        customStyles: versionData.customStyles,
        colorScheme: versionData.colorScheme,
        fontFamily: versionData.fontFamily,
      },
      include: { template: true },
    });

    return this.mapResumeToResponse(updatedResume);
  }

  // ============ Import from Profile ============

  async importFromProfile(userId: string, resumeId: string): Promise<ResumeResponse> {
    const resume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    // Get user profile and student profile with department
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found', 404);
    }

    // Build personal info from profile
    const personalInfo: any = {
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
    };

    // Note: StudentProfile doesn't have phone, linkedIn, github, portfolio fields
    // These would need to be added to the schema if needed

    // Build education from student profile
    let education: any[] = [];
    if (user.profile) {
      const sp = user.profile;
      const currentYear = new Date().getFullYear();
      const courseYearNum = sp.courseYear ? parseInt(sp.courseYear) : undefined;
      
      education.push({
        id: crypto.randomUUID(),
        institution: 'Your College', // Default since collegeName is not in schema
        degree: 'Bachelor of Engineering', // Default, could be made configurable
        field: sp.department?.name || '',
        startDate: courseYearNum ? `${currentYear - courseYearNum + 1}` : '',
        endDate: courseYearNum ? `${currentYear - courseYearNum + 4}` : '',
        current: courseYearNum ? courseYearNum < 4 : false,
        gpa: sp.averageCgpa?.toString() || undefined,
      });
    }

    // Build skills from profile
    let skills: any[] = [];
    if (user.profile?.skills && user.profile.skills.length > 0) {
      const profileSkills = user.profile.skills as string[];
      skills.push({
        id: crypto.randomUUID(),
        name: 'Technical Skills',
        skills: profileSkills,
      });
    }

    // Create version before import
    await this.createVersionSnapshot(resumeId, 'Before profile import');

    const updatedResume = await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        personalInfo,
        education: education.length > 0 ? education : undefined,
        skills: skills.length > 0 ? skills : undefined,
      },
      include: { template: true },
    });

    return this.mapResumeToResponse(updatedResume);
  }

  // ============ Save to Profile ============

  async saveToProfile(userId: string, resumeId: string, fileName?: string): Promise<{ resumeId: string; fileName: string; message: string }> {
    // Verify the resume exists and belongs to the user
    const userResume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
      include: { template: true },
    });

    if (!userResume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    // Check if user already has 5 resumes in profile
    const existingResumesCount = await prisma.resume.count({
      where: { userId },
    });

    if (existingResumesCount >= 5) {
      throw new AppError('BAD_REQUEST', 'Maximum 5 resumes allowed in profile. Please delete one to add a new resume.', 400);
    }

    // Check if this resume is already linked to a profile resume
    const existingLink = await prisma.resume.findFirst({
      where: { linkedResumeId: resumeId },
    });

    if (existingLink) {
      throw new AppError('CONFLICT', 'This resume is already saved to your profile', 400);
    }

    // Generate file name
    const finalFileName = fileName || `${userResume.title}.pdf`;

    // Create a profile resume entry linked to the builder resume
    const profileResume = await prisma.resume.create({
      data: {
        userId,
        fileName: finalFileName,
        fileUrl: '', // Will be generated when PDF is exported
        linkedResumeId: resumeId,
        mimeType: 'application/pdf',
        isDefault: existingResumesCount === 0, // First resume is default
      },
    });

    return {
      resumeId: profileResume.id,
      fileName: finalFileName,
      message: 'Resume saved to profile successfully',
    };
  }

  async unlinkFromProfile(userId: string, resumeId: string): Promise<void> {
    // Verify the resume exists and belongs to the user
    const userResume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!userResume) {
      throw new AppError('NOT_FOUND', 'Resume not found', 404);
    }

    // Find and delete the linked profile resume
    const profileResume = await prisma.resume.findFirst({
      where: { linkedResumeId: resumeId, userId },
    });

    if (!profileResume) {
      throw new AppError('NOT_FOUND', 'Resume is not linked to profile', 404);
    }

    await prisma.resume.delete({
      where: { id: profileResume.id },
    });
  }

  // ============ Helper Methods ============

  private async generateUniqueSlug(
    userId: string, 
    baseSlug: string, 
    excludeId?: string
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.userResume.findFirst({
        where: {
          userId,
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async createVersionSnapshot(resumeId: string, changeNote?: string): Promise<void> {
    const resume = await prisma.userResume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) return;

    // Get current max version
    const lastVersion = await prisma.resumeVersion.findFirst({
      where: { resumeId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastVersion?.version || 0) + 1;

    // Create version snapshot
    await prisma.resumeVersion.create({
      data: {
        resumeId,
        version: newVersion,
        changeNote,
        data: {
          personalInfo: resume.personalInfo,
          summary: resume.summary,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills,
          projects: resume.projects,
          certifications: resume.certifications,
          languages: resume.languages,
          achievements: resume.achievements,
          customSections: resume.customSections,
          sectionOrder: resume.sectionOrder,
          hiddenSections: resume.hiddenSections,
          customStyles: resume.customStyles,
          colorScheme: resume.colorScheme,
          fontFamily: resume.fontFamily,
        },
      },
    });

    // Keep only last 20 versions
    const versionsToDelete = await prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { version: 'desc' },
      skip: 20,
      select: { id: true },
    });

    if (versionsToDelete.length > 0) {
      await prisma.resumeVersion.deleteMany({
        where: {
          id: { in: versionsToDelete.map(v => v.id) },
        },
      });
    }
  }

  private calculateCompletionStatus(resume: any, contentUpdate?: Partial<ResumeContent>): boolean {
    const content = {
      personalInfo: contentUpdate?.personalInfo || resume.personalInfo,
      experience: contentUpdate?.experience || resume.experience,
      education: contentUpdate?.education || resume.education,
      skills: contentUpdate?.skills || resume.skills,
    };

    // Check required sections
    const hasPersonalInfo = content.personalInfo && 
      content.personalInfo.firstName && 
      content.personalInfo.lastName && 
      content.personalInfo.email;

    const hasExperience = content.experience && 
      Array.isArray(content.experience) && 
      content.experience.length > 0;

    const hasEducation = content.education && 
      Array.isArray(content.education) && 
      content.education.length > 0;

    const hasSkills = content.skills && 
      Array.isArray(content.skills) && 
      content.skills.length > 0;

    return !!(hasPersonalInfo && (hasExperience || hasEducation) && hasSkills);
  }

  private mapTemplateToResponse(template: any): ResumeTemplateResponse {
    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      description: template.description,
      thumbnail: template.thumbnail,
      category: template.category,
      layout: template.layout as TemplateLayout,
      styles: template.styles as TemplateStyles,
      isPremium: template.isPremium,
      popularity: template.popularity,
    };
  }

  private mapResumeToResponse(resume: any): ResumeResponse {
    return {
      id: resume.id,
      title: resume.title,
      slug: resume.slug,
      template: this.mapTemplateToResponse(resume.template),
      content: {
        personalInfo: resume.personalInfo || undefined,
        summary: resume.summary || undefined,
        experience: resume.experience || undefined,
        education: resume.education || undefined,
        skills: resume.skills || undefined,
        projects: resume.projects || undefined,
        certifications: resume.certifications || undefined,
        languages: resume.languages || undefined,
        achievements: resume.achievements || undefined,
        customSections: resume.customSections || undefined,
      },
      customization: {
        sectionOrder: resume.sectionOrder,
        hiddenSections: resume.hiddenSections,
        customStyles: resume.customStyles || undefined,
        colorScheme: resume.colorScheme || undefined,
        fontFamily: resume.fontFamily || undefined,
      },
      isComplete: resume.isComplete,
      lastAtsScore: resume.lastAtsScore,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    };
  }
}
