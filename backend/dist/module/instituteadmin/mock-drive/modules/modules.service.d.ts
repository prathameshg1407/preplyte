import { CreateModuleDTO, UpdateModuleDTO, ReorderModulesDTO, ListModulesOptions, ModuleResponse, ModuleWithAvailability, ModulesSummary } from './modules.types';
export declare class MockDriveModuleService {
    addModule(mockDriveId: string, instituteId: string, data: CreateModuleDTO): Promise<ModuleResponse>;
    getModules(mockDriveId: string, instituteId: string, options?: ListModulesOptions): Promise<ModuleResponse[] | ModuleWithAvailability[]>;
    getModulesSummary(mockDriveId: string, instituteId: string): Promise<ModulesSummary>;
    getModule(mockDriveId: string, moduleId: string, instituteId: string): Promise<ModuleWithAvailability>;
    updateModule(mockDriveId: string, moduleId: string, instituteId: string, data: UpdateModuleDTO): Promise<ModuleResponse>;
    deleteModule(mockDriveId: string, moduleId: string, instituteId: string): Promise<void>;
    reorderModules(mockDriveId: string, instituteId: string, data: ReorderModulesDTO): Promise<ModuleResponse[]>;
    duplicateModule(mockDriveId: string, moduleId: string, instituteId: string): Promise<ModuleResponse>;
    getSupportedLanguages(): string[];
    private verifyAccess;
    private validateConfig;
    private checkAvailability;
    private validateModules;
    private toResponse;
}
export declare const mockDriveModuleService: MockDriveModuleService;
//# sourceMappingURL=modules.service.d.ts.map