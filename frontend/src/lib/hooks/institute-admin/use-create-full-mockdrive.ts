// src/lib/hooks/institute-admin/use-create-full-mockdrive.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { mockDriveService } from '@/lib/api/services/institute-admin/mockdrive.service';
import { mockDriveModulesService } from '@/lib/api/services/institute-admin/mockdrive-modules.service';
import { mockDriveKeys } from './use-mockdrive';
import {
  WizardFormData,
  WizardModule,
} from '@/lib/store/institute-admin/mockdrive-store';
import {
  MockDriveDetails,
  MockDriveModule,
  CreateModuleInput,
  UpdateModuleInput,
  ModuleConfig,
  AptitudeModuleConfig,
  MachineCodingModuleConfig,
  AiInterviewModuleConfig,
  MockDriveModuleType,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface FailedModule {
  name: string;
  order: number;
  moduleType: MockDriveModuleType;
  error: string;
}

interface CreateFullMockDriveResult {
  mockDrive: MockDriveDetails;
  modulesCreated: number;
  modulesFailed: number;
  failedModules: FailedModule[];
}

interface UpdateFullMockDriveInput {
  mockDriveId: string;
  formData: WizardFormData;
  existingModuleIds?: string[];
}

interface UpdateFullMockDriveResult {
  mockDrive: MockDriveDetails;
  modulesCreated: number;
  modulesUpdated: number;
  modulesDeleted: number;
  failedOperations: Array<{ operation: string; error: string }>;
}

interface PartialCreationError extends Error {
  mockDriveId?: string;
  modulesCreated?: number;
  failedModules?: FailedModule[];
}

// ============================================
// Helper Functions
// ============================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error occurred';
}

function convertToModuleConfig(
  moduleType: MockDriveModuleType,
  config: Record<string, unknown>
): ModuleConfig {
  switch (moduleType) {
    case MockDriveModuleType.APTITUDE:
      return {
        difficulty:
          (config.difficulty as DifficultyLevel) ?? DifficultyLevel.MEDIUM,
        questionTypes: (config.questionTypes as QuestionType[]) ?? [],
        numberOfQuestions: (config.numberOfQuestions as number) ?? 10,
        marksPerQuestion: (config.marksPerQuestion as number) ?? 1,
        negativeMarking: (config.negativeMarking as number) ?? 0,
      } satisfies AptitudeModuleConfig;

    case MockDriveModuleType.MACHINE_CODING:
      return {
        difficulty:
          (config.difficulty as DifficultyLevel) ?? DifficultyLevel.MEDIUM,
        numberOfQuestions: (config.numberOfQuestions as number) ?? 1,
        allowedLanguages: (config.allowedLanguages as string[]) ?? [],
        partialScoring: (config.partialScoring as boolean) ?? true,
        maxScorePerQuestion: (config.maxScorePerQuestion as number) ?? 100,
      } satisfies MachineCodingModuleConfig;

    case MockDriveModuleType.AI_INTERVIEW:
      return {
        difficulty:
          (config.difficulty as AiInterviewDifficulty) ??
          AiInterviewDifficulty.MID,
        jobTitle: (config.jobTitle as string) ?? '',
        companyName: (config.companyName as string | null) ?? null,
        focusAreas: (config.focusAreas as string[]) ?? [],
        targetQuestions: (config.targetQuestions as number) ?? 5,
      } satisfies AiInterviewModuleConfig;

    default:
      throw new Error(`Unknown module type: ${moduleType}`);
  }
}

function toModuleInput(module: WizardModule, order?: number): CreateModuleInput {
  const typedConfig = convertToModuleConfig(module.moduleType, module.config);

  return {
    moduleType: module.moduleType,
    order: order ?? module.order,
    name: module.name || null,
    timeLimit: module.timeLimit,
    weightage: module.weightage,
    config: typedConfig,
    passingScore: module.passingScore,
    instructions: module.instructions || null,
  };
}

function toUpdateModuleInput(module: WizardModule): UpdateModuleInput {
  const typedConfig = convertToModuleConfig(module.moduleType, module.config);

  return {
    order: module.order,
    name: module.name || null,
    timeLimit: module.timeLimit,
    weightage: module.weightage,
    config: typedConfig,
    passingScore: module.passingScore,
    instructions: module.instructions || null,
  };
}

/**
 * Check if a string looks like a valid CUID
 * CUIDs start with 'c' and are 25 characters long
 */
function isValidCuid(id: string): boolean {
  return typeof id === 'string' && id.length >= 20 && id.startsWith('c');
}

/**
 * Check if a module ID looks like a temporary/new ID
 */
function isTemporaryId(id: string): boolean {
  if (!id) return true;
  return (
    id.startsWith('temp-') ||
    id.startsWith('new-') ||
    id.startsWith('module-') ||
    !isValidCuid(id)
  );
}

// ============================================
// Hook: useCreateFullMockDrive
// ============================================

export function useCreateFullMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    CreateFullMockDriveResult,
    PartialCreationError,
    WizardFormData
  >({
    mutationFn: async (
      formData: WizardFormData
    ): Promise<CreateFullMockDriveResult> => {
      let mockDriveId: string | undefined;
      let modulesCreated = 0;
      const failedModules: FailedModule[] = [];

      try {
        // Step 1: Create the mock drive
        const mockDrive = await mockDriveService.create({
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          registrationStartDate: formData.registrationStartDate,
          registrationEndDate: formData.registrationEndDate,
          driveStartDate: formData.driveStartDate,
          driveEndDate: formData.driveEndDate,
          maxRegistrations: formData.maxRegistrations,
          allowLateSubmission: formData.allowLateSubmission,
          showLeaderboard: formData.showLeaderboard,
          showResultsImmediately: formData.showResultsImmediately,
          resultsReleaseDate: formData.resultsReleaseDate,
          shuffleQuestions: formData.shuffleQuestions,
          enableProctoring: formData.enableProctoring,
          proctoringSettings: formData.proctoringSettings,
        });

        mockDriveId = mockDrive.id;

        // Step 2: Create modules with sequential orders
        if (formData.modules.length > 0) {
          const sortedModules = [...formData.modules].sort(
            (a, b) => a.order - b.order
          );

          for (let i = 0; i < sortedModules.length; i++) {
            const module = sortedModules[i];
            try {
              // Use sequential order (1, 2, 3, ...) to avoid conflicts
              const moduleInput = toModuleInput(module, i + 1);
              await mockDriveModulesService.addModule(mockDrive.id, moduleInput);
              modulesCreated++;
            } catch (moduleError) {
              console.error(
                `Failed to create module ${module.order} (${module.name}):`,
                moduleError
              );
              failedModules.push({
                name: module.name,
                order: module.order,
                moduleType: module.moduleType,
                error: getErrorMessage(moduleError),
              });
            }
          }

          if (modulesCreated === 0 && formData.modules.length > 0) {
            const error: PartialCreationError = new Error(
              'Failed to create any modules. Please try adding modules manually.'
            );
            error.mockDriveId = mockDriveId;
            error.modulesCreated = 0;
            error.failedModules = failedModules;
            throw error;
          }
        }

        // Step 3: Fetch the updated mock drive
        const updatedMockDrive = await mockDriveService.getById(mockDrive.id);

        return {
          mockDrive: updatedMockDrive,
          modulesCreated,
          modulesFailed: failedModules.length,
          failedModules,
        };
      } catch (error) {
        if ((error as PartialCreationError).mockDriveId) {
          throw error;
        }

        if (mockDriveId) {
          const customError: PartialCreationError = new Error(
            getErrorMessage(error)
          );
          customError.mockDriveId = mockDriveId;
          customError.modulesCreated = modulesCreated;
          customError.failedModules = failedModules;
          throw customError;
        }

        throw error;
      }
    },

    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: mockDriveKeys.detail(result.mockDrive.id),
      });

      if (result.modulesFailed > 0) {
        const failedNames = result.failedModules
          .map((m) => `"${m.name}"`)
          .join(', ');

        toast({
          title: 'Mock Drive Created (Partial Success)',
          description: `Created "${result.mockDrive.title}" with ${result.modulesCreated} module(s). Failed modules: ${failedNames}. Please add them manually.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Mock Drive Created',
          description: `Successfully created "${result.mockDrive.title}" with ${result.modulesCreated} module(s).`,
        });
      }
    },

    onError: (error: PartialCreationError) => {
      if (error.mockDriveId) {
        const moduleInfo = error.modulesCreated
          ? ` ${error.modulesCreated} module(s) were created successfully.`
          : '';

        toast({
          variant: 'destructive',
          title: 'Partial Creation',
          description: `Mock drive created but some modules failed.${moduleInfo} Error: ${error.message}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: error.message || 'Failed to create mock drive',
        });
      }
    },
  });
}

// ============================================
// Hook: useUpdateFullMockDrive
// ============================================

export function useUpdateFullMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateFullMockDriveResult, Error, UpdateFullMockDriveInput>(
    {
      mutationFn: async ({
        mockDriveId,
        formData,
        existingModuleIds = [],
      }): Promise<UpdateFullMockDriveResult> => {
        let modulesCreated = 0;
        let modulesUpdated = 0;
        let modulesDeleted = 0;
        const failedOperations: Array<{ operation: string; error: string }> = [];

        // Step 1: Update mock drive basic info
        try {
          await mockDriveService.update(mockDriveId, {
            title: formData.title,
            description: formData.description,
            instructions: formData.instructions,
            registrationStartDate: formData.registrationStartDate,
            registrationEndDate: formData.registrationEndDate,
            driveStartDate: formData.driveStartDate,
            driveEndDate: formData.driveEndDate,
            maxRegistrations: formData.maxRegistrations,
            allowLateSubmission: formData.allowLateSubmission,
            showLeaderboard: formData.showLeaderboard,
            showResultsImmediately: formData.showResultsImmediately,
            resultsReleaseDate: formData.resultsReleaseDate,
            shuffleQuestions: formData.shuffleQuestions,
            enableProctoring: formData.enableProctoring,
            proctoringSettings: formData.proctoringSettings,
          });
        } catch (error) {
          throw new Error(
            `Failed to update mock drive: ${getErrorMessage(error)}`
          );
        }

        // Step 2: Categorize modules into existing and new
        const existingModules: WizardModule[] = [];
        const newModules: WizardModule[] = [];

        for (const module of formData.modules) {
          // A module is "existing" if its ID is in existingModuleIds AND is a valid CUID
          const isExisting =
            existingModuleIds.includes(module.id) && isValidCuid(module.id);

          if (isExisting) {
            existingModules.push(module);
          } else {
            newModules.push(module);
          }
        }

        // Step 3: Find modules to delete (in existingModuleIds but not in current modules)
        const currentValidModuleIds = existingModules.map((m) => m.id);
        const modulesToDelete = existingModuleIds.filter(
          (id) => isValidCuid(id) && !currentValidModuleIds.includes(id)
        );

        // Step 4: Delete removed modules first
        for (const moduleId of modulesToDelete) {
          try {
            await mockDriveModulesService.deleteModule(mockDriveId, moduleId);
            modulesDeleted++;
          } catch (error) {
            console.error(`Failed to delete module ${moduleId}:`, error);
            failedOperations.push({
              operation: `Delete module`,
              error: getErrorMessage(error),
            });
          }
        }

        // Step 5: Update existing modules
        for (const module of existingModules) {
          try {
            const updateInput = toUpdateModuleInput(module);
            await mockDriveModulesService.updateModule(
              mockDriveId,
              module.id,
              updateInput
            );
            modulesUpdated++;
          } catch (error) {
            console.error(`Failed to update module ${module.name}:`, error);
            failedOperations.push({
              operation: `Update module "${module.name}"`,
              error: getErrorMessage(error),
            });
          }
        }

        // Step 6: Create new modules
        if (newModules.length > 0) {
          // Get the current max order from updated existing modules
          const existingOrders = existingModules.map((m) => m.order);
          const maxExistingOrder =
            existingOrders.length > 0 ? Math.max(...existingOrders) : 0;

          // Sort new modules by their intended order
          const sortedNewModules = [...newModules].sort(
            (a, b) => a.order - b.order
          );

          // Assign sequential orders starting from maxExistingOrder + 1
          for (let i = 0; i < sortedNewModules.length; i++) {
            const module = sortedNewModules[i];
            const newOrder = maxExistingOrder + i + 1;

            try {
              const moduleInput = toModuleInput(module, newOrder);
              await mockDriveModulesService.addModule(mockDriveId, moduleInput);
              modulesCreated++;
            } catch (error) {
              console.error(`Failed to create module ${module.name}:`, error);
              failedOperations.push({
                operation: `Create module "${module.name}"`,
                error: getErrorMessage(error),
              });
            }
          }
        }

        // Step 7: Reorder modules if needed (only if no failed operations)
        if (failedOperations.length === 0 && formData.modules.length > 1) {
          try {
            // Fetch fresh modules from DB to get actual IDs
            const currentModulesFromDb = (await mockDriveModulesService.getModules(
              mockDriveId,
              {}
            )) as MockDriveModule[];

            if (Array.isArray(currentModulesFromDb) && currentModulesFromDb.length > 1) {
              // Check if orders are already sequential
              const sortedByOrder = [...currentModulesFromDb].sort(
                (a, b) => a.order - b.order
              );
              const needsReorder = sortedByOrder.some(
                (m, idx) => m.order !== idx + 1
              );

              if (needsReorder) {
                // Create reorder input based on intended order from formData
                // Map DB modules to their intended positions
                const reorderInput = {
                  modules: currentModulesFromDb
                    .map((dbModule) => {
                      // Find the matching wizard module
                      const wizardModule = formData.modules.find(
                        (wm) =>
                          wm.id === dbModule.id ||
                          wm.moduleType === dbModule.moduleType
                      );
                      return {
                        dbModule,
                        intendedOrder: wizardModule?.order ?? dbModule.order,
                      };
                    })
                    .sort((a, b) => a.intendedOrder - b.intendedOrder)
                    .map((item, idx) => ({
                      moduleId: item.dbModule.id,
                      order: idx + 1,
                    })),
                };

                // Validate all moduleIds are valid CUIDs before sending
                const allValidIds = reorderInput.modules.every((m) =>
                  isValidCuid(m.moduleId)
                );

                if (allValidIds) {
                  await mockDriveModulesService.reorderModules(
                    mockDriveId,
                    reorderInput
                  );
                } else {
                  console.warn(
                    'Skipping reorder: invalid module IDs detected',
                    reorderInput.modules
                  );
                }
              }
            }
          } catch (error) {
            // Log but don't fail the entire operation for reorder issues
            console.warn('Failed to reorder modules:', error);
          }
        }

        // Step 8: Fetch and return updated mock drive
        const updatedMockDrive = await mockDriveService.getById(mockDriveId);

        return {
          mockDrive: updatedMockDrive,
          modulesCreated,
          modulesUpdated,
          modulesDeleted,
          failedOperations,
        };
      },

      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: mockDriveKeys.detail(result.mockDrive.id),
        });

        const operations = [];
        if (result.modulesCreated > 0) {
          operations.push(`${result.modulesCreated} created`);
        }
        if (result.modulesUpdated > 0) {
          operations.push(`${result.modulesUpdated} updated`);
        }
        if (result.modulesDeleted > 0) {
          operations.push(`${result.modulesDeleted} deleted`);
        }

        const modulesSummary =
          operations.length > 0 ? ` Modules: ${operations.join(', ')}.` : '';

        if (result.failedOperations.length > 0) {
          toast({
            title: 'Mock Drive Updated (Partial Success)',
            description: `Updated "${result.mockDrive.title}".${modulesSummary} ${result.failedOperations.length} operation(s) failed.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Mock Drive Updated',
            description: `Successfully updated "${result.mockDrive.title}".${modulesSummary}`,
          });
        }
      },

      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message || 'Failed to update mock drive',
        });
      },
    }
  );
}

// ============================================
// Export Types
// ============================================

export type {
  CreateFullMockDriveResult,
  UpdateFullMockDriveInput,
  UpdateFullMockDriveResult,
  FailedModule,
  PartialCreationError,
};