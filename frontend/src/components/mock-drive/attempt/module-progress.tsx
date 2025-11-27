// src/components/mock-drive/attempt/module-progress.tsx

'use client';

import { FC } from 'react';
import { Check, Lock, Play, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleAttemptState } from '@/types/mockdrive.types';
import { MODULE_TYPE_CONFIG, MODULE_ATTEMPT_STATUS_CONFIG } from '@/lib/constants/mockdrive.constants';

interface ModuleProgressProps {
  modules: ModuleAttemptState[];
  currentModuleId: string;
}

export const ModuleProgress: FC<ModuleProgressProps> = ({ modules, currentModuleId }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return <Lock className="h-4 w-4" />;
      case 'AVAILABLE':
        return <Play className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <Check className="h-4 w-4" />;
      case 'TIMED_OUT':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {modules.map((module, index) => {
        const statusConfig = MODULE_ATTEMPT_STATUS_CONFIG[module.status];
        const typeConfig = MODULE_TYPE_CONFIG[module.moduleType];
        const isCurrent = module.moduleId === currentModuleId;

        return (
          <div key={module.moduleId} className="flex items-center">
            {/* Module Circle */}
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                isCurrent && 'ring-2 ring-offset-2 ring-primary',
                statusConfig.bgColor,
                module.status === 'COMPLETED' && 'border-green-500 bg-green-500 text-white',
                module.status === 'IN_PROGRESS' && 'border-blue-500',
                module.status === 'LOCKED' && 'border-gray-300',
                module.status === 'AVAILABLE' && 'border-blue-500'
              )}
              title={`${module.name || typeConfig.label} - ${statusConfig.label}`}
            >
              {getStatusIcon(module.status)}
            </div>

            {/* Connector Line */}
            {index < modules.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1',
                  modules[index + 1].status !== 'LOCKED' ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};