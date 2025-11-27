// src/components/practice/ai-interview/session/difficulty-selector.tsx

'use client';

import { cn } from '@/lib/utils';
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
}[] = [
  {
    value: 'ENTRY',
    label: 'Entry Level',
    description: 'Foundational concepts, basic problem-solving',
    color: 'bg-green-500',
  },
  {
    value: 'MID',
    label: 'Mid Level',
    description: 'Practical experience, moderate complexity',
    color: 'bg-blue-500',
  },
  {
    value: 'SENIOR',
    label: 'Senior Level',
    description: 'Deep expertise, system design, leadership',
    color: 'bg-orange-500',
  },
  {
    value: 'LEAD',
    label: 'Lead/Principal',
    description: 'Strategic thinking, architecture, team management',
    color: 'bg-red-500',
  },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DIFFICULTY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-all hover:bg-accent',
            value === option.value
              ? 'border-primary bg-primary/5'
              : 'border-muted'
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', option.color)} />
            <span className="font-medium">{option.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {option.description}
          </span>
          {value === option.value && (
            <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}