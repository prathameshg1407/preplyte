// src/components/institute-admin/mock-drive/modules/module-card.tsx

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MockDriveModuleType } from '@/types/admin.mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { AptitudeConfig } from './aptitude-config';
import { MachineConfig } from './machine-config';
import { InterviewConfig } from './interview-config';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  Brain,
  Code,
  MessageSquare,
  Clock,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface WizardModule {
  id: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string;
  timeLimit: number;
  weightage: number;
  config: Record<string, unknown>;
  passingScore: number | null;
  instructions: string;
}

interface ModuleCardProps {
  module: WizardModule;
  index: number;
  onUpdate: (updates: Partial<WizardModule>) => void;
  onRemove: () => void;
}

// ============================================
// Constants
// ============================================

const MODULE_ICONS: Record<MockDriveModuleType, typeof Brain> = {
  [MockDriveModuleType.APTITUDE]: Brain,
  [MockDriveModuleType.MACHINE_CODING]: Code,
  [MockDriveModuleType.AI_INTERVIEW]: MessageSquare,
};

// ============================================
// Component
// ============================================

export function ModuleCard({ module, index, onUpdate, onRemove }: ModuleCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const config = MODULE_TYPE_CONFIG[module.moduleType];
  const Icon = MODULE_ICONS[module.moduleType];

  // Handlers
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ name: e.target.value });
    },
    [onUpdate]
  );

  const handleTimeLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ timeLimit: parseInt(e.target.value, 10) || 1 });
    },
    [onUpdate]
  );

  const handleWeightageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ weightage: parseFloat(e.target.value) || 0 });
    },
    [onUpdate]
  );

  const handlePassingScoreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onUpdate({ passingScore: value ? parseFloat(value) : null });
    },
    [onUpdate]
  );

  const handleInstructionsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ instructions: e.target.value });
    },
    [onUpdate]
  );

  const handleConfigUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      onUpdate({ config: { ...module.config, ...updates } });
    },
    [module.config, onUpdate]
  );

  // Render module-specific config editor
  const renderConfigEditor = () => {
    const props = {
      config: module.config,
      onUpdate: handleConfigUpdate,
    };

    switch (module.moduleType) {
      case MockDriveModuleType.APTITUDE:
        return <AptitudeConfig {...props} />;
      case MockDriveModuleType.MACHINE_CODING:
        return <MachineConfig {...props} />;
      case MockDriveModuleType.AI_INTERVIEW:
        return <InterviewConfig {...props} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* Left side - Drag handle and info */}
            <div className="flex items-center gap-3">
              <div
                className="cursor-move text-muted-foreground hover:text-foreground"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>

              <div>
                <div className="font-semibold">{module.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {module.timeLimit} min
                  </span>
                  <span>{module.weightage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              {/* Delete Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete module</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Module</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{module.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Collapse Toggle */}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isOpen ? 'Collapse' : 'Expand'}
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 border-t pt-4">
            {/* Basic Settings */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`name-${module.id}`}>Module Name</Label>
                <Input
                  id={`name-${module.id}`}
                  value={module.name}
                  onChange={handleNameChange}
                  placeholder="Enter module name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`timeLimit-${module.id}`}>
                  Time Limit (minutes)
                </Label>
                <Input
                  id={`timeLimit-${module.id}`}
                  type="number"
                  min={1}
                  max={300}
                  value={module.timeLimit}
                  onChange={handleTimeLimitChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`weightage-${module.id}`}>Weightage (%)</Label>
                <Input
                  id={`weightage-${module.id}`}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={module.weightage}
                  onChange={handleWeightageChange}
                />
              </div>
            </div>

            {/* Module-specific Configuration */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-4 font-medium">Module Configuration</h4>
              {renderConfigEditor()}
            </div>

            {/* Advanced Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`passingScore-${module.id}`}>
                  Passing Score (optional)
                </Label>
                <Input
                  id={`passingScore-${module.id}`}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Leave empty for no threshold"
                  value={module.passingScore ?? ''}
                  onChange={handlePassingScoreChange}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum score required to pass this module
                </p>
              </div>
            </div>

            {/* Module Instructions */}
            <div className="space-y-2">
              <Label htmlFor={`instructions-${module.id}`}>
                Module Instructions (optional)
              </Label>
              <Textarea
                id={`instructions-${module.id}`}
                placeholder="Specific instructions for this module..."
                value={module.instructions}
                onChange={handleInstructionsChange}
                rows={3}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}