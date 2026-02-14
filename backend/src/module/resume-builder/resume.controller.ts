import { Request, Response, NextFunction } from 'express';
import { ResumeService } from './resume.service';
import { ATSService } from './ats.service';
import { 
  createResumeSchema, 
  updateResumeSchema, 
  updateSectionSchema,
  duplicateResumeSchema,
  changeTemplateSchema,
  templateFiltersSchema,
  resumeFiltersSchema,
} from './resume.validation';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/errors';

export class ResumeController {
  private atsService: ATSService;

  constructor(private resumeService: ResumeService) {
    this.atsService = new ATSService();
  }

  // ============ Template Endpoints ============

  getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = templateFiltersSchema.parse(req.query);
      const templates = await this.resumeService.getTemplates(filters);
      
      sendSuccess(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const template = await this.resumeService.getTemplateById(templateId);
      
      sendSuccess(res, template, 'Template retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getTemplateBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const template = await this.resumeService.getTemplateBySlug(slug);
      
      sendSuccess(res, template, 'Template retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getTemplateCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.resumeService.getTemplateCategories();
      
      sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============ Resume CRUD Endpoints ============

  createResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('=== CREATE RESUME ENDPOINT HIT ===');
      console.log('User ID:', req.user?.id);
      console.log('Request body:', req.body);
      
      const userId = req.user!.id;
      const data = req.body; // Already validated by middleware
      
      console.log('Creating resume with data:', data);
      
      const resume = await this.resumeService.createResume(userId, data);
      
      console.log('Resume created successfully:', resume.id);
      
      sendSuccess(res, resume, 'Resume created successfully', 201);
    } catch (error) {
      console.error('Error in createResume controller:', error);
      next(error);
    }
  };

  getUserResumes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const filters = resumeFiltersSchema.parse(req.query);
      
      const result = await this.resumeService.getUserResumes(userId, filters);
      
      sendSuccess(res, result, 'Resumes retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getResumeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      
      const resume = await this.resumeService.getResumeById(userId, resumeId);
      
      sendSuccess(res, resume, 'Resume retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getResumeBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { slug } = req.params;
      
      const resume = await this.resumeService.getResumeBySlug(userId, slug);
      
      sendSuccess(res, resume, 'Resume retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      const data = req.body; // Already validated by middleware
      
      const resume = await this.resumeService.updateResume(userId, resumeId, data);
      
      sendSuccess(res, resume, 'Resume updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateResumeSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      const { section, data } = req.body; // Already validated by middleware
      
      const resume = await this.resumeService.updateResumeSection(
        userId, 
        resumeId, 
        section, 
        data
      );
      
      sendSuccess(res, resume, `${section} updated successfully`);
    } catch (error) {
      next(error);
    }
  };

  deleteResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      
      await this.resumeService.deleteResume(userId, resumeId);
      
      sendSuccess(res, null, 'Resume deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  duplicateResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      const data = req.body; // Already validated by middleware
      
      const resume = await this.resumeService.duplicateResume(userId, resumeId, data);
      
      sendSuccess(res, resume, 'Resume duplicated successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  changeTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      const { templateId } = req.body; // Already validated by middleware
      
      const resume = await this.resumeService.changeTemplate(userId, resumeId, templateId);
      
      sendSuccess(res, resume, 'Template changed successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============ Version History Endpoints ============

  getResumeVersions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      
      const versions = await this.resumeService.getResumeVersions(userId, resumeId);
      
      sendSuccess(res, versions, 'Versions retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  restoreVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId, versionId } = req.params;
      
      const resume = await this.resumeService.restoreVersion(userId, resumeId, versionId);
      
      sendSuccess(res, resume, 'Version restored successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============ Import Endpoints ============

  importFromProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resumeId } = req.params;
      
      const resume = await this.resumeService.importFromProfile(userId, resumeId);
      
      sendSuccess(res, resume, 'Profile data imported successfully');
    } catch (error) {
      next(error);
    }
  };

  // ============ ATS Score Checker Endpoints ============

  checkATSScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      const { jobRole, jobDescription } = req.body;

      if (!file) {
        throw new AppError('NO_FILE', 'Please upload a resume file', 400);
      }

      // Validate file
      this.atsService.validateFile(file);

      // Extract text from file
      const resumeText = await this.atsService.extractText(file);

      // Analyze resume
      const analysis = await this.atsService.analyzeResume(resumeText, jobRole, jobDescription);

      const response = {
        ...analysis,
        analyzedAt: new Date().toISOString(),
      };

      sendSuccess(res, response, 'Resume analyzed successfully');
    } catch (error) {
      next(error);
    }
  };
}