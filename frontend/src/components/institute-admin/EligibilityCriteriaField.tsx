// src/components/institute-admin/EligibilityCriteriaField.tsx

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, GraduationCap, Award, BookOpen } from 'lucide-react';
import { EligibilityCriteria } from '@/types/event.types';

interface EligibilityCriteriaFieldProps {
  value: EligibilityCriteria;
  onChange: (value: EligibilityCriteria) => void;
}

export const EligibilityCriteriaField: React.FC<EligibilityCriteriaFieldProps> = ({ value, onChange }) => {
  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newSkill = e.currentTarget.value.trim();
      const currentSkills = value.requiredSkills || [];
      if (!currentSkills.includes(newSkill)) {
        onChange({ ...value, requiredSkills: [...currentSkills, newSkill] });
      }
      e.currentTarget.value = '';
    }
  };

  const removeSkill = (skill: string) => {
    onChange({ 
      ...value, 
      requiredSkills: (value.requiredSkills || []).filter(s => s !== skill) 
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">
            <Award className="h-4 w-4 text-primary" />
            Minimum CGPA
          </Label>
          <Input 
            type="number" 
            step="0.01" 
            placeholder="e.g., 7.5"
            value={value.minCgpa || ''}
            className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
            onChange={(e) => onChange({ ...value, minCgpa: parseFloat(e.target.value) || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">
            <BookOpen className="h-4 w-4 text-primary" />
            Max Backlogs
          </Label>
          <Input 
            type="number" 
            placeholder="e.g., 0"
            value={value.maxBacklogs ?? ''}
            className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
            onChange={(e) => onChange({ ...value, maxBacklogs: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">
            <GraduationCap className="h-4 w-4 text-primary" />
            10th Min %
          </Label>
          <Input 
            type="number" 
            placeholder="e.g., 60"
            value={value.minMarks10 || ''}
            className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
            onChange={(e) => onChange({ ...value, minMarks10: parseFloat(e.target.value) || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">
            <GraduationCap className="h-4 w-4 text-primary" />
            12th Min %
          </Label>
          <Input 
            type="number" 
            placeholder="e.g., 60"
            value={value.minMarks12 || ''}
            className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
            onChange={(e) => onChange({ ...value, minMarks12: parseFloat(e.target.value) || undefined })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 pl-1">
           Required Skills (Press Enter to add)
        </Label>
        <div className="flex flex-wrap gap-2 p-4 border rounded-2xl bg-muted/20 focus-within:ring-2 focus-within:ring-primary/20 transition-all backdrop-blur-sm border-border/50">
          {value.requiredSkills?.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1.5 px-3 py-1.5 bg-background shadow-sm border-primary/20 hover:bg-primary/5 transition-colors">
              <span className="font-bold text-xs">{skill}</span>
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => removeSkill(skill)} 
              />
            </Badge>
          ))}
          <input 
            className="flex-1 bg-transparent border-none outline-none text-sm min-w-[140px] placeholder:text-muted-foreground/50"
            placeholder="e.g. React, Node.js..."
            onKeyDown={handleSkillAdd}
          />
        </div>
      </div>
    </div>
  );
};
