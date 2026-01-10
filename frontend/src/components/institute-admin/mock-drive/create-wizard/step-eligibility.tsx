// src/components/institute-admin/mock-drive/create-wizard/step-eligibility.tsx

'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';
import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, GraduationCap, BookOpen, Building2, Sparkles } from 'lucide-react';

// ============================================
// Tag Input Component
// ============================================

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  tags: string[];
  onRemove: (tag: string) => void;
  label: string;
}

function TagInput({
  value,
  onChange,
  onAdd,
  placeholder,
  tags,
  onRemove,
  label,
}: TagInputProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onAdd();
      }
    },
    [onAdd]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={label}
        />
        <Button
          type="button"
          onClick={onAdd}
          size="icon"
          variant="secondary"
          disabled={!value.trim()}
          aria-label={`Add ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label={`${label} list`}>
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Number Input Component
// ============================================

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  step = 1,
}: NumberFieldProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      onChange(inputValue ? parseFloat(inputValue) : null);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={handleChange}
      />
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function StepEligibility() {
  const eligibility = useCreateWizardStore((state) => state.eligibility);
  const setEligibility = useCreateWizardStore((state) => state.setEligibility);

  // Local state for new tag inputs
  const [newDepartment, setNewDepartment] = useState('');
  const [newCourseYear, setNewCourseYear] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Department handlers
  const addDepartment = useCallback(() => {
    const trimmed = newDepartment.trim();
    if (trimmed && !eligibility.allowedDepartmentIds.includes(trimmed)) {
      setEligibility({
        allowedDepartmentIds: [...eligibility.allowedDepartmentIds, trimmed],
      });
      setNewDepartment('');
    }
  }, [newDepartment, eligibility.allowedDepartmentIds, setEligibility]);

  const removeDepartment = useCallback(
    (dept: string) => {
      setEligibility({
        allowedDepartmentIds: eligibility.allowedDepartmentIds.filter((d) => d !== dept),
      });
    },
    [eligibility.allowedDepartmentIds, setEligibility]
  );

  // Course year handlers
  const addCourseYear = useCallback(() => {
    const trimmed = newCourseYear.trim();
    if (trimmed && !eligibility.allowedCourseYears.includes(trimmed)) {
      setEligibility({
        allowedCourseYears: [...eligibility.allowedCourseYears, trimmed],
      });
      setNewCourseYear('');
    }
  }, [newCourseYear, eligibility.allowedCourseYears, setEligibility]);

  const removeCourseYear = useCallback(
    (year: string) => {
      setEligibility({
        allowedCourseYears: eligibility.allowedCourseYears.filter((y) => y !== year),
      });
    },
    [eligibility.allowedCourseYears, setEligibility]
  );

  // Skill handlers
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (trimmed && !eligibility.requiredSkills.includes(trimmed)) {
      setEligibility({
        requiredSkills: [...eligibility.requiredSkills, trimmed],
      });
      setNewSkill('');
    }
  }, [newSkill, eligibility.requiredSkills, setEligibility]);

  const removeSkill = useCallback(
    (skill: string) => {
      setEligibility({
        requiredSkills: eligibility.requiredSkills.filter((s) => s !== skill),
      });
    },
    [eligibility.requiredSkills, setEligibility]
  );

  // Number field handlers
  const handleMinCgpaChange = useCallback(
    (value: number | null) => setEligibility({ minCgpa: value }),
    [setEligibility]
  );

  const handleMaxCgpaChange = useCallback(
    (value: number | null) => setEligibility({ maxCgpa: value }),
    [setEligibility]
  );

  const handleMinMarks10Change = useCallback(
    (value: number | null) => setEligibility({ minMarks10: value }),
    [setEligibility]
  );

  const handleMinMarks12Change = useCallback(
    (value: number | null) => setEligibility({ minMarks12: value }),
    [setEligibility]
  );

  const handleMaxBacklogsChange = useCallback(
    (value: number | null) => setEligibility({ maxBacklogs: value }),
    [setEligibility]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Eligibility Criteria</h2>
        <p className="text-sm text-muted-foreground">
          Define who can register for this mock drive. Leave fields empty to allow all students.
        </p>
      </div>

      {/* Academic Requirements */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CGPA Criteria */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              CGPA Requirements
            </CardTitle>
            <CardDescription>Set minimum and maximum CGPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                id="minCgpa"
                label="Minimum CGPA"
                value={eligibility.minCgpa}
                onChange={handleMinCgpaChange}
                placeholder="e.g., 6.0"
                min={0}
                max={10}
                step={0.1}
              />
              <NumberField
                id="maxCgpa"
                label="Maximum CGPA"
                value={eligibility.maxCgpa}
                onChange={handleMaxCgpaChange}
                placeholder="e.g., 10.0"
                min={0}
                max={10}
                step={0.1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Marks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Academic Marks
            </CardTitle>
            <CardDescription>Minimum marks in 10th and 12th</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                id="minMarks10"
                label="Min 10th Marks (%)"
                value={eligibility.minMarks10}
                onChange={handleMinMarks10Change}
                placeholder="e.g., 60"
                min={0}
                max={100}
              />
              <NumberField
                id="minMarks12"
                label="Min 12th Marks (%)"
                value={eligibility.minMarks12}
                onChange={handleMinMarks12Change}
                placeholder="e.g., 60"
                min={0}
                max={100}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backlog Limit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Backlog Limit</CardTitle>
          <CardDescription>Maximum number of backlogs allowed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <NumberField
              id="maxBacklogs"
              label="Maximum Backlogs"
              value={eligibility.maxBacklogs}
              onChange={handleMaxBacklogsChange}
              placeholder="e.g., 0"
              min={0}
              max={20}
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Allowed Departments
          </CardTitle>
          <CardDescription>
            Leave empty to allow all departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            value={newDepartment}
            onChange={setNewDepartment}
            onAdd={addDepartment}
            placeholder="e.g., Computer Science"
            tags={eligibility.allowedDepartmentIds}
            onRemove={removeDepartment}
            label="department"
          />
        </CardContent>
      </Card>

      {/* Course Years */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Allowed Course Years</CardTitle>
          <CardDescription>Leave empty to allow all years</CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            value={newCourseYear}
            onChange={setNewCourseYear}
            onAdd={addCourseYear}
            placeholder="e.g., 3rd Year, Final Year"
            tags={eligibility.allowedCourseYears}
            onRemove={removeCourseYear}
            label="course year"
          />
        </CardContent>
      </Card>

      {/* Required Skills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            Required Skills
          </CardTitle>
          <CardDescription>
            Students must have at least one of these skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            value={newSkill}
            onChange={setNewSkill}
            onAdd={addSkill}
            placeholder="e.g., Python, JavaScript"
            tags={eligibility.requiredSkills}
            onRemove={removeSkill}
            label="skill"
          />
        </CardContent>
      </Card>
    </div>
  );
}