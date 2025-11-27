// src/components/institute-admin/mock-drive/create-wizard/step-modules.tsx

'use client';

import { useMemo } from 'react';
import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MockDriveModuleType } from '@/types/admin.mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { ModuleCard } from '../modules/module-card';
import {
  Plus,
  Brain,
  Code,
  MessageSquare,
  AlertCircle,
  Layers,
  Clock,
} from 'lucide-react';

// ============================================
// Constants
// ============================================

const MODULE_ICONS: Record<MockDriveModuleType, typeof Brain> = {
  [MockDriveModuleType.APTITUDE]: Brain,
  [MockDriveModuleType.MACHINE_CODING]: Code,
  [MockDriveModuleType.AI_INTERVIEW]: MessageSquare,
};

const WEIGHTAGE_TOLERANCE = 0.01;

// ============================================
// Component
// ============================================

export function StepModules() {
  const modules = useCreateWizardStore((state) => state.modules);
  const addModule = useCreateWizardStore((state) => state.addModule);
  const updateModule = useCreateWizardStore((state) => state.updateModule);
  const removeModule = useCreateWizardStore((state) => state.removeModule);

  // Calculated values
  const { totalWeightage, totalDuration, isWeightageValid } = useMemo(() => {
    const weightage = modules.reduce((sum, m) => sum + (m.weightage ?? 0), 0);
    const duration = modules.reduce((sum, m) => sum + (m.timeLimit ?? 0), 0);
    const isValid = Math.abs(weightage - 100) < WEIGHTAGE_TOLERANCE;

    return {
      totalWeightage: weightage,
      totalDuration: duration,
      isWeightageValid: isValid,
    };
  }, [modules]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Modules</h2>
          <p className="text-sm text-muted-foreground">
            Add and configure the test modules for this mock drive.
          </p>
        </div>

        {/* Add Module Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {Object.entries(MODULE_TYPE_CONFIG).map(([type, config]) => {
              const Icon = MODULE_ICONS[type as MockDriveModuleType];
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => addModule(type as MockDriveModuleType)}
                  className="cursor-pointer"
                >
                  <Icon className={`mr-3 h-4 w-4 ${config.color}`} />
                  <div className="flex flex-col">
                    <span className="font-medium">{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Bar */}
      {modules.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Module Count */}
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{modules.length}</span> module
                  {modules.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Total Duration */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{totalDuration}</span> min total
                </span>
              </div>

              {/* Total Weightage */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total Weightage:</span>
                <Badge
                  variant={isWeightageValid ? 'default' : 'destructive'}
                  className="font-mono"
                >
                  {totalWeightage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weightage Warning */}
      {modules.length > 0 && !isWeightageValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Module weightages must sum to exactly 100%. Current total:{' '}
            {totalWeightage.toFixed(1)}%
          </AlertDescription>
        </Alert>
      )}

      {/* Module List or Empty State */}
      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No modules added</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Add at least one module to configure the mock drive. You can add
              aptitude tests, machine coding challenges, or AI interviews.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Module
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                {Object.entries(MODULE_TYPE_CONFIG).map(([type, config]) => {
                  const Icon = MODULE_ICONS[type as MockDriveModuleType];
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => addModule(type as MockDriveModuleType)}
                      className="cursor-pointer"
                    >
                      <Icon className={`mr-3 h-4 w-4 ${config.color}`} />
                      <div className="flex flex-col">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {config.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              onUpdate={(updates) => updateModule(module.id, updates)}
              onRemove={() => removeModule(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}