"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languagesService = exports.LanguagesService = void 0;
const db_1 = require("../../../lib/db");
const errors_1 = require("../../../utils/errors");
class LanguagesService {
    /**
     * Get all active programming languages
     */
    async getAllLanguages(activeOnly = true) {
        const where = activeOnly ? { isActive: true } : {};
        const languages = await db_1.prisma.programmingLanguage.findMany({
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
    async getLanguageById(id) {
        const language = await db_1.prisma.programmingLanguage.findUnique({
            where: { id },
        });
        if (!language) {
            throw new errors_1.NotFoundError('Programming language');
        }
        return language;
    }
    /**
     * Get language by Judge0 ID
     */
    async getLanguageByJudge0Id(judge0Id) {
        const language = await db_1.prisma.programmingLanguage.findUnique({
            where: { judge0Id },
        });
        if (!language) {
            throw new errors_1.NotFoundError('Programming language');
        }
        return language;
    }
}
exports.LanguagesService = LanguagesService;
exports.languagesService = new LanguagesService();
//# sourceMappingURL=languages.service.js.map