"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languagesController = exports.LanguagesController = void 0;
const languages_service_1 = require("./languages.service");
const response_1 = require("../../../utils/response");
class LanguagesController {
    /**
     * GET /api/languages
     */
    async getAllLanguages(req, res, next) {
        try {
            const activeOnly = req.query.active !== 'false';
            const result = await languages_service_1.languagesService.getAllLanguages(activeOnly);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/languages/:id
     */
    async getLanguageById(req, res, next) {
        try {
            const result = await languages_service_1.languagesService.getLanguageById(req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LanguagesController = LanguagesController;
exports.languagesController = new LanguagesController();
//# sourceMappingURL=languages.controller.js.map