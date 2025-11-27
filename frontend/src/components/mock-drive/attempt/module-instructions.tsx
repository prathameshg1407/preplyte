// src/components/mock-drive/attempt/module-instructions.tsx

'use client';

import { FC } from 'react';
import { Clock, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { MockDriveModuleType, ModuleConfig } from '@/types/mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/mockdrive.constants';

interface ModuleInstructionsProps {
  moduleName: string | null;
  moduleType: MockDriveModuleType;
  timeLimit: number;
  instructions: string | null;
  config: ModuleConfig;
  onStart: () => void;
  isStarting: boolean;
}

export const ModuleInstructions: FC<ModuleInstructionsProps> = ({
  moduleName,
  moduleType,
  timeLimit,
  instructions,
  config,
  onStart,
  isStarting,
}) => {
  const typeConfig = MODULE_TYPE_CONFIG[moduleType];

  const getConfigDetails = () => {
    switch (moduleType) {
      case 'APTITUDE': {
        const aptConfig = config as any;
        return [
          { label: 'Questions', value: aptConfig.numberOfQuestions },
          { label: 'Marks per Question', value: aptConfig.marksPerQuestion },
          { label: 'Negative Marking', value: aptConfig.negativeMarking || 'None' },
          { label: 'Difficulty', value: aptConfig.difficulty },
        ];
      }
      case 'MACHINE_CODING': {
        const machineConfig = config as any;
        return [
          { label: 'Problems', value: machineConfig.numberOfQuestions },
          { label: 'Max Score per Problem', value: machineConfig.maxScorePerQuestion },
          { label: 'Partial Scoring', value: machineConfig.partialScoring ? 'Yes' : 'No' },
          { label: 'Difficulty', value: machineConfig.difficulty },
        ];
      }
      case 'AI_INTERVIEW': {
        const interviewConfig = config as any;
        return [
          { label: 'Target Questions', value: interviewConfig.targetQuestions },
          { label: 'Role', value: interviewConfig.jobTitle },
          { label: 'Focus Areas', value: interviewConfig.focusAreas?.join(', ') || 'General' },
          { label: 'Difficulty', value: interviewConfig.difficulty },
        ];
      }
      default:
        return [];
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className={typeConfig.color}>{moduleName || typeConfig.label}</span>
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLimit} minutes
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Config Details */}
        <div className="grid grid-cols-2 gap-4">
          {getConfigDetails().map((detail, index) => (
            <div key={index} className="flex justify-between p-2 bg-muted rounded">
              <span className="text-muted-foreground">{detail.label}</span>
              <span className="font-medium">{detail.value}</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        {instructions && (
          <div className="space-y-2">
            <h4 className="font-medium">Instructions</h4>
            <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
              {instructions}
            </div>
          </div>
        )}

        {/* General Guidelines */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Important
          </h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Once you start, the timer cannot be paused</li>
            <li>The module will auto-submit when time runs out</li>
            <li>Make sure you have a stable internet connection</li>
            <li>Do not refresh or close the browser during the test</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onStart} disabled={isStarting} className="w-full" size="lg">
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Module
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};