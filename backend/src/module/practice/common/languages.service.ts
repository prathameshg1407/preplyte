import { prisma } from "../../../lib/db";
import { NotFoundError } from '../../../utils/errors';

export class LanguagesService {
  /**
   * Get all active programming languages
   */
  async getAllLanguages(activeOnly: boolean = true) {
    const where = activeOnly ? { isActive: true } : {};

    const languages = await prisma.programmingLanguage.findMany({
      where,
      select: {
        id: true,
        name: true,
        monacoId: true,
        judge0Id: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      languages,
      totalCount: languages.length,
    };
  }

  /**
   * Get language details with template
   */
  async getLanguageById(id: string) {
    const language = await prisma.programmingLanguage.findUnique({
      where: { id },
    });

    if (!language) {
      throw new NotFoundError('Programming language');
    }

    return language;
  }

  /**
   * Get language by Judge0 ID
   */
  async getLanguageByJudge0Id(judge0Id: number) {
    const language = await prisma.programmingLanguage.findUnique({
      where: { judge0Id },
    });

    if (!language) {
      throw new NotFoundError('Programming language');
    }

    return language;
  }
}

export const languagesService = new LanguagesService();