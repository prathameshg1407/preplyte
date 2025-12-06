// src/components/practice/ai-interview/session/difficulty-selector.tsx

'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { InterviewDifficulty } from '@/types/interview.types';

interface DifficultySelectorProps {
  value: InterviewDifficulty;
  onChange: (value: InterviewDifficulty) => void;
}

const DIFFICULTY_OPTIONS: {
  value: InterviewDifficulty;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}[] = [
  {
    value: 'ENTRY',
    label: 'Entry Level',
    description: 'Foundational concepts, basic problem-solving',
    color: 'bg-green-500',
    bgColor: 'hover:bg-green-500/5 data-[selected=true]:bg-green-500/10 data-[selected=true]:border-green-500',
  },
  {
    value: 'MID',
    label: 'Mid Level',
    description: 'Practical experience, moderate complexity',
    color: 'bg-blue-500',
    bgColor: 'hover:bg-blue-500/5 data-[selected=true]:bg-blue-500/10 data-[selected=true]:border-blue-500',
  },
  {
    value: 'SENIOR',
    label: 'Senior Level',
    description: 'Deep expertise, system design, leadership',
    color: 'bg-orange-500',
    bgColor: 'hover:bg-orange-500/5 data-[selected=true]:bg-orange-500/10 data-[selected=true]:border-orange-500',
  },
  {
    value: 'LEAD',
    label: 'Lead/Principal',
    description: 'Strategic thinking, architecture, team management',
    color: 'bg-red-500',
    bgColor: 'hover:bg-red-500/5 data-[selected=true]:bg-red-500/10 data-[selected=true]:border-red-500',
  },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DIFFICULTY_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            data-selected={isSelected}
            className={cn(
              'relative flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-all',
              'border-muted',
              option.bgColor
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <div className={cn('h-2.5 w-2.5 rounded-full', option.color)} />
              <span className="font-medium">{option.label}</span>
              {isSelected && (
                <Check className="h-4 w-4 ml-auto text-primary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}